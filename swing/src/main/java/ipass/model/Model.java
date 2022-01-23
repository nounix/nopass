package ipass.model;

import java.util.Timer;

public class Model {

    private static final int mpwdLen = 12;
    private static final String notesPath = "iPASS.bin";
    private static final int delayClearCB = 10000;
    private final Timer timer = new Timer();
    private String mpwd;

    public static int getMpwdLen() {
        return mpwdLen;
    }

    public static String getNotesPath() {
        return notesPath;
    }

    public static int getDelayClearCB() {
        return delayClearCB;
    }

    public String getMpwd() {
        return mpwd;
    }

    public void setMpwd(String mpwd) {
        this.mpwd = mpwd;
    }

    public Timer getTimer() {
        return timer;
    }
}
