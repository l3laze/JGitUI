package com.github.l3laze.jgitui;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.provider.Settings;
import android.view.Window;
import android.widget.Toast;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;

import androidx.core.content.ContextCompat;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

public class MainActivity extends Activity {
    protected final int STORAGE_PERM_CODE = 1;
    protected WebView webView;
    private final AndroidInterface androidBridge = new AndroidInterface(this);
    private final FSInterface fsBridge = new FSInterface();
    private final PathInterface pathBridge = new PathInterface();
    private final JGitInterface jgitBridge = new JGitInterface();

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webapp);

        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .addPathHandler("/res/", new WebViewAssetLoader.ResourcesPathHandler(this))
                .build();
        webView.setWebViewClient(new LocalContentWebViewClient(assetLoader));
        webView.setWebChromeClient(new WebChromeClient());
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);

        webView.addJavascriptInterface(androidBridge, "android");
        webView.addJavascriptInterface(fsBridge, "fs");
        webView.addJavascriptInterface(pathBridge, "path");
        webView.addJavascriptInterface(jgitBridge, "jgit");

        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html?storage=" + Environment.isExternalStorageManager());
    }


    @SuppressLint("QueryPermissionsNeeded")
    public void requestPermission (String name) {
        if (!Environment.isExternalStorageManager() && ContextCompat.checkSelfPermission(getApplicationContext(), Manifest.permission.MANAGE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_DENIED) {
            Intent intent = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION, Uri.parse("package:" + getApplicationContext().getPackageName()));

            if (intent.resolveActivity(getPackageManager()) != null) {
                startActivityForResult(intent, STORAGE_PERM_CODE);
            } else {
                Toast.makeText(MainActivity.this, "Failed to request permissions.", Toast.LENGTH_LONG).show();
            }
        } else {
            asyncJavaResponse("perms." + name + ".value", "true");
        }
    }

    protected String wordToTitleCase (String s) {
        return Character.toTitleCase(s.charAt(0)) + s.substring(1).toLowerCase();
    }

    @Override
    public void onActivityResult (int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        String name = requestCode == STORAGE_PERM_CODE
            ? "storage"
            : "internet";

        boolean result = resultCode == RESULT_OK;

        if (requestCode == STORAGE_PERM_CODE && !Environment.isExternalStorageManager()) {
            result = false;
        }

        Toast.makeText(MainActivity.this, wordToTitleCase(name) + " permission: " + (result ? "Granted" : "Denied"), Toast.LENGTH_SHORT).show();
        asyncJavaResponse("perms." + name + ".value", "false");
    }

    public void asyncJavaResponse (String name, String val) {
        webView.post(() -> webView.evaluateJavascript("javascript:" + name + "=" + val, null));
    }

    private static class LocalContentWebViewClient extends WebViewClientCompat {

        private final WebViewAssetLoader mAssetLoader;

        LocalContentWebViewClient(WebViewAssetLoader assetLoader) {
            mAssetLoader = assetLoader;
        }

        @Override
        public WebResourceResponse shouldInterceptRequest (WebView view, WebResourceRequest request) {
            return mAssetLoader.shouldInterceptRequest(request.getUrl());
        }
    }
}
