package com.github.l3laze.jgitui;

import android.webkit.JavascriptInterface;

import java.io.File;
import java.nio.file.Paths;
import java.util.Objects;

public class PathInterface {
    /** @noinspection unused, EmptyMethod */
    protected void dummy () {}

    @JavascriptInterface
    public static String normalize(String path) {
        return Paths.get(path).normalize().toString();
    }

    @JavascriptInterface
    public static String relativize(String from, String to) {
        return Paths.get(from).relativize(Paths.get(to)).toString();
    }

    @JavascriptInterface
    public static String resolve(String path, String other) {
        return Paths.get(path).resolve(other).toString();
    }

    @JavascriptInterface
    public static String getAbsolutePath(String path) {
        return new File(path).getAbsolutePath();
    }

    @JavascriptInterface
    public static String dirname(String path) {
        return Objects.requireNonNull(new File(path).getParentFile()).getAbsolutePath();
    }
}
