package ipass.util;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.logging.Logger;

public class RunDetection implements Runnable {

    private final static Logger log = Logger.getLogger(RunDetection.class.getName());
    private final static int socketPort = 31313;
    private ServerSocket listener;
    private Runnable fnc;

    private volatile boolean exit = false;

    public RunDetection(Runnable fnc) {
        try {
            this.fnc = fnc;
            this.listener = new ServerSocket(socketPort);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static boolean isRunning() {
        try {
            new Socket("localhost", socketPort).close();
            return true;
        } catch (IOException e) {
            log.warning(e.toString());
            return false;
        }
    }

    public void run() {
        log.info("RunDetection started.");

        while (!exit && listener != null && fnc != null) {
            waitForSocket();
            fnc.run();
        }

        log.info("RunDetection stopped.");
    }

    public void stop() {
        exit = true;

        try {
            listener.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void start() {
        new Thread(this).start();
    }

    private void waitForSocket() {
        try {
            listener.accept().close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
