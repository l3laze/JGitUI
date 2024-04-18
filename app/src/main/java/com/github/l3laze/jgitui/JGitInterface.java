package com.github.l3laze.jgitui;

import android.util.Log;
import android.webkit.JavascriptInterface;

import java.util.Arrays;

public class JGitInterface {
    // protected static Git git;
    // protected static Repository repo;

    /** @noinspection unused, EmptyMethod */
    private void dummy () {}
    private static final String TAG_JGit = "JGitInterface";

    @JavascriptInterface
    public static void initRepository (String path) {
        Log.d(TAG_JGit, "Initializing repo in " + path, null);
    }

    @JavascriptInterface
    public static void cloneRepository (String from, String to) {
        Log.d(TAG_JGit, "Cloning repo: '" + from + "' into '" + to, null);
    }

    @JavascriptInterface
    public static void cloneRepository (String from, String to, String[] branches) {
        Log.d(TAG_JGit, "Cloning repo: '" + from + "' into '" + to + "'\nCloning branches: " + Arrays.toString(branches), null);
    }

    @JavascriptInterface
    public static void cloneRepository (String from, String to, String[] branches, String useBranch) {
        Log.d(TAG_JGit, "Cloning repo: '" + from + "' into '" + to + "'\nCloning branches: " + Arrays.toString(branches) + "\nChecking out branch: " + useBranch, null);
    }
}
