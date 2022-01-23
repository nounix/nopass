package ipass;

import ipass.controller.Controller;
import ipass.util.RunDetection;
import ipass.view.View;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

import java.security.Security;
import java.util.logging.Logger;

public class App {

    private final static Logger log = Logger.getLogger(App.class.getName());
    private static RunDetection detection;

    public static void main(String[] args) {
        if (!RunDetection.isRunning()) {
            // since Java 9 set the unlimited crypto policy in code, not by applying the JCE jars.
            Security.setProperty("crypto.policy", "unlimited");

            // init the BC security provider
            if (Security.getProvider("BC") == null) {
                Security.insertProviderAt(new BouncyCastleProvider(), 0);
                log.info("Security provider added successfully");
            }

            Controller c = new Controller(new View("iPASS"));
            c.getView().getGui().getFrame().setVisible(true);

            detection = new RunDetection(() -> c.getView().getGui().getFrame().setVisible(true));
            detection.start();
            // detection.stop();
        }
    }
}
