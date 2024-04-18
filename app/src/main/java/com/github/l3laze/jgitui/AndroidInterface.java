package com.github.l3laze.jgitui;

import android.annotation.SuppressLint;
import android.webkit.JavascriptInterface;

import java.io.File;

public class AndroidInterface {
    @SuppressLint("StaticFieldLeak")
    private static MainActivity app;

    private static final String TAG_JGit = "JGitInterface";

    AndroidInterface (MainActivity appActivity) {
        app = appActivity;
    }

    /** @noinspection unused, EmptyMethod */
    protected void dummy () {}

    /** @noinspection SameReturnValue*/
    @JavascriptInterface
    public static int androidVersion() {
        return android.os.Build.VERSION.SDK_INT;
    }

    @JavascriptInterface
    public static void requestPermission (String permName) {
        app.requestPermission(permName);
    }

    @JavascriptInterface
    public static String homeFolder() {
        return new File("/storage/emulated/0").toString();
        // return Environment.getExternalStorageDirectory().getAbsolutePath();
    }

    @JavascriptInterface
    public static String pwd() {
        return System.getProperty("user.dir");
    }
}
