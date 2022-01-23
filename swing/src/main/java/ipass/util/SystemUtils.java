package ipass.util;

import javax.swing.*;
import java.awt.*;
import java.awt.datatransfer.Clipboard;
import java.awt.datatransfer.StringSelection;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.TimerTask;

public class SystemUtils {

    public static void copyToClipBoard(String pwd) {
        Clipboard clipboard = Toolkit.getDefaultToolkit().getSystemClipboard();
        StringSelection strSel = new StringSelection(pwd);
        clipboard.setContents(strSel, null);
    }

    public static boolean getAlertDecision(String title, String header, String content) {
        int reply = JOptionPane.showConfirmDialog(null, header + "\n" + content, title, JOptionPane.YES_NO_OPTION);
        return reply == JOptionPane.YES_OPTION;
    }

    public static void writeFile(String path, byte[] data) {
        try {
            Files.write(Paths.get(path), data);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static TimerTask genTimerTask(Runnable r) {
        return new TimerTask() {

            @Override
            public void run() {
                r.run();
            }
        };
    }
}
