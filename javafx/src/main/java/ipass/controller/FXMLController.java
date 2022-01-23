package ipass.controller;

import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.input.Clipboard;
import javafx.scene.layout.GridPane;
import org.bouncycastle.crypto.DataLengthException;
import org.bouncycastle.crypto.InvalidCipherTextException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Timer;
import java.util.TimerTask;
import java.util.logging.Logger;

import static ipass.util.Crypto.*;
import static ipass.util.SystemUtils.*;

public class FXMLController {

    @FXML
    GridPane gridPane;
    @FXML
    Label label;
    @FXML
    PasswordField passwordField;
    @FXML
    Button showBtn;
    @FXML
    Button accListBtn;
    @FXML
    ScrollPane accListPane;
    @FXML
    TextArea accListArea;

    private String mpwd;
    private static final int mpwdLen = 12;
    private static final String notesPath = "iPASS.bin";

    private static final Timer timer = new Timer();
    private static final int delayClearCB = 10000;

    private final static Logger log = Logger.getLogger(FXMLController.class.getName());

    @FXML
    public void initialize() {
        log.info("FXMLController.initialize");
        showBtn.managedProperty().bind(showBtn.visibleProperty());
        accListBtn.managedProperty().bind(accListBtn.visibleProperty());
        accListPane.managedProperty().bind(accListPane.visibleProperty());
    }

    @FXML
    private void togglePassword() {
        if (label.getText().equals("Choose Account!")) {
            label.setText(getPwd(passwordField.getText() + mpwd, mpwdLen));
            showBtn.setText("Hide");
        } else {
            label.setText("Choose Account!");
            showBtn.setText("Show");
        }
    }

    @FXML
    private void toggleNotes() {
        String notRead = "Could not read file!";
        String notDecrypt = "Could not decrypt file!";

        if (accListPane.isVisible()) {
            accListBtn.setText("Notes");
            accListPane.setVisible(false);
            gridPane.getScene().getWindow().sizeToScene();

            if (accListArea.getText().equals(notRead) || accListArea.getText().equals(notDecrypt)) {
                if (getAlertDecision("iPASS - Warning",
                        "You are going to overwrite or create notes!",
                        "Continue?")
                )
                    writeFile(notesPath, encrypt(mpwd, accListArea.getText()));
            } else
                writeFile(notesPath, encrypt(mpwd, accListArea.getText()));
        } else {
            try {
                accListArea.setText(decrypt(mpwd, Files.readAllBytes(Paths.get(notesPath))));
            } catch (IOException e) {
                e.printStackTrace();
                accListArea.setText(notRead);
            } catch (DataLengthException | InvalidCipherTextException e) {
                e.printStackTrace();
                accListArea.setText(notDecrypt);
            }

            accListBtn.setText("Save");
            accListPane.setVisible(true);
            gridPane.getScene().getWindow().sizeToScene();
        }
    }

    @FXML
    private void getPassword() {
        if (label.getText().equals("Set master password!")) {
            mpwd = passwordField.getText();
            passwordField.setText("");
            label.setText("Choose Account!");
            showBtn.setVisible(true);
            accListBtn.setVisible(true);
            gridPane.getScene().getWindow().sizeToScene();
        } else {
            String salt = passwordField.getText();
            copyToClipBoard(getPwd(salt + mpwd, mpwdLen));

            timer.schedule(new TimerTask() {
                @Override
                public void run() {
                    Platform.runLater(() -> Clipboard.getSystemClipboard().clear());
                }
            }, delayClearCB);

            passwordField.setText("");
            gridPane.getScene().getWindow().hide();
        }
    }
}