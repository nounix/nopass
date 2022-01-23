package ipass;

import ipass.util.RunDetection;
import javafx.application.Application;
import javafx.application.Platform;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

import java.io.IOException;
import java.security.Security;
import java.util.logging.Logger;

public class App extends Application {

    private static Stage stage;
    private static RunDetection detection;

    private final static Logger log = Logger.getLogger(RunDetection.class.getName());

    public static void main(String[] args) {
        if (!RunDetection.isRunning()) {
            // since Java 9 set the unlimited crypto policy in code, not by applying the JCE jars.
            Security.setProperty("crypto.policy", "unlimited");

            // init the BC security provider
            if (Security.getProvider("BC") == null) {
                Security.insertProviderAt(new BouncyCastleProvider(), 0);
                log.info("Security provider added successfully");
            }

            detection = new RunDetection(() -> Platform.runLater(App::showApp));
            detection.start();

            launch();
        }
    }

    @Override
    public void start(Stage stage) {
        App.stage = stage;

        Platform.setImplicitExit(false);

        stage.setOnCloseRequest(t -> Platform.exit());

        stage.setAlwaysOnTop(true);

        try {
            Parent root = FXMLLoader.load(getClass().getResource("/fxml/app.fxml"));
            stage.setTitle("iPASS");
            stage.setScene(new Scene(root));
            stage.show();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void stop() {
        log.info("Stage is closing");
        detection.stop();
        System.exit(0);
    }

    public static void showApp() {
        stage.show();
        stage.toFront();
        stage.requestFocus();
    }
}
