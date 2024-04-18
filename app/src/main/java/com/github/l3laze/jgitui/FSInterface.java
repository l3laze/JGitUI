package com.github.l3laze.jgitui;

import android.system.ErrnoException;
import android.system.StructStat;
import android.webkit.JavascriptInterface;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Objects;

public class FSInterface {
    /** @noinspection unused, EmptyMethod */
    protected void dummy () {}

    public static String buildStats(StructStat stats) {
        return "{" +
                "\"dev\":" + stats.st_dev +
                ",\"ino\":" + stats.st_ino +
                ",\"mode\":" + stats.st_mode +
                ",\"nlink\":" + stats.st_nlink +
                ",\"uid\":" + stats.st_uid +
                ",\"gid\":" + stats.st_gid +
                ",\"rdev\":" + stats.st_rdev +
                ",\"size\":" + stats.st_size +
                ",\"blksize\":" + stats.st_blksize +
                ",\"blocks\":" + stats.st_blocks +
                ",\"atimeMs\":" + stats.st_atime +
                ",\"mtimeMs\":" + stats.st_mtime +
                ",\"ctimeMs\":" + stats.st_ctime +
                ",\"birthtime\":" + stats.st_mtime +
                "}";
    }

    public static String getExplanation(String errName, String context, String path) {
        StringBuilder sb = new StringBuilder();

        switch (errName) {
            case "ENOENT":
                sb.append("Part of ").append(path).append(" does not exist or is a dangling symbolic link.");
                break;
            case "EACCES":
                sb.append("Access to ").append(path).append(" (or one of the directories) was denied.");
                break;
            case "EROFS":
                sb.append("The path ").append(path).append(" is on a read-only filesystem.");
                break;
            case "EPERM":
                sb.append("Not permitted to perform ").append(context).append(". Likely SELinux related.");
                break;
            default:
                sb.append("No explanation available for ").append(errName).append(".");
                break;
        }

        return sb.toString();
    }

    @JavascriptInterface
    public static String lstat(String path) {
        try {
            return buildStats(android.system.Os.lstat(path));
        } catch (ErrnoException ee) {
            String name = android.system.OsConstants.errnoName(ee.errno);

            return "{\"error\":\"" + name + ": " + getExplanation(name, "lstat", path) + "\"}";
        }
    }

    @JavascriptInterface
    public static String stat(String path) {
        try {
            return buildStats(android.system.Os.stat(path));
        } catch (ErrnoException ee) {
            String name = android.system.OsConstants.errnoName(ee.errno);

            return "{\"error\":\"" + name + ": " + getExplanation(name, "stat", path) + "\"}";
        }
    }

    @JavascriptInterface
    public static String readlink(String path) {
        try {
            android.system.Os.readlink(path);
        } catch (ErrnoException ee) {
            String name = android.system.OsConstants.errnoName(ee.errno);

            return "{\"error\":\"" + name + ": " + getExplanation(name, "readlink", path) + "\"}";
        }

        return "true";
    }

    @JavascriptInterface
    public static String createSymlink(String source, String target) {
        try {
            android.system.Os.symlink(source, target);
        } catch (ErrnoException ee) {
            String name = android.system.OsConstants.errnoName(ee.errno);

            return "{\"error\":\"" + name + ": " + getExplanation(name, "symlink", source + " OR " + target) + "\"}";
        }

        return "true";
    }

    @JavascriptInterface
    public static boolean isFile(String path) {
        return new File(path).isFile();
    }

    @JavascriptInterface
    public static boolean isDir(String path) {
        return new File(path).isFile();
    }

    @JavascriptInterface
    public static boolean isSymlink(String path) {
        return Files.isSymbolicLink(Paths.get(path));
    }

    @JavascriptInterface
    public static boolean fileExists(String path) {
        return new File(path).exists();
    }

    @JavascriptInterface
    public static void makeDirectory(String path) {
        new File(path).mkdir();
    }

    @JavascriptInterface
    public static void makeDirectoryTree(String path) {
        new File(path).mkdirs();
    }

    @JavascriptInterface
    public static void delete(String path) {
        try {
            Files.delete(Paths.get(path));
        } catch (IOException ioe) {}
    }

    @JavascriptInterface
    public static void rmdir(String path) {
        File dir = new File(path);

        if (dir.isDirectory()) {
            String[] children = dir.list();

            for (int i = 0; i < Objects.requireNonNull(children).length; i++) {
                new File(dir, children[i]).delete();
            }

            dir.delete();
        }
    }

    @JavascriptInterface
    public static String readDir(String path) {
        try {
            return String.join(",", new File(path).list());
        } catch (SecurityException se) {
            return "{\"error\":\"" + se.getMessage() + "\"}";
        }
    }

    @JavascriptInterface
    public static String sizeOnDisk(String path) {
        try {
            return "" + Files.size(Paths.get(path));
        } catch (IOException ioe) {
            return "{\"error\":\"" + ioe.getMessage() + "\"}";
        }
    }

    @JavascriptInterface
    public static void move(String source, String target) {
        try {
            Files.move(Paths.get(source), Paths.get(target));
        } catch (IOException ioe) {
            // return "{\"error\":\"" + ioe.getMessage() + "\"}";
        }
    }

    @JavascriptInterface
    public static String writeFile(String path, String data) {
        try {
            Files.write(Paths.get(path), data.getBytes());
        } catch (Exception e) {
            return e.getMessage();
        }

        return "";
    }

    @JavascriptInterface
    public static String readFile(String path) {
        String data;

        try {
            data = new String(Files.readAllBytes(Paths.get(path)));
        } catch (Exception e) {
            data = "";
        }

        return data;
    }
}
