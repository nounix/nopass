package ipass.controller;

import ipass.model.Model;
import ipass.util.SystemUtils;
import ipass.view.View;
import org.bouncycastle.crypto.DataLengthException;
import org.bouncycastle.crypto.InvalidCipherTextException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.logging.Logger;

import static ipass.util.Crypto.*;
import static ipass.util.SystemUtils.*;

public class Controller {

    private final static Logger log = Logger.getLogger(Controller.class.getName());
    private Model m;
    private View v;

    public Controller(View v) {
        m = new Model();
        this.v = v;
        v.getPasswordField().addActionListener(event -> getPassword());
        v.getShowBtn().addActionListener(event -> togglePassword());
        v.getAccListBtn().addActionListener(event -> toggleNotes());
    }

    public View getView() {
        return v;
    }

    private void togglePassword() {
        if (v.getLabel().getText().equals("Choose Account!")) {
            v.getLabel().setText(getPwd(v.getPasswordField().getText() + m.getMpwd(), Model.getMpwdLen()));
            v.getGui().alignCenter(v.getLabel());
            v.getShowBtn().setText("Hide");
        } else {
            v.getLabel().setText("Choose Account!");
            v.getGui().alignCenter(v.getLabel());
            v.getShowBtn().setText("Show");
        }
    }

    private void toggleNotes() {
        String notRead = "Could not read file!";
        String notDecrypt = "Could not decrypt file!";

        if (v.getAccListPane().isVisible()) {
            v.getAccListBtn().setText("Notes");
            v.getAccListPane().setVisible(false);
            v.getGui().getFrame().setSize(200, 120);

            if (v.getAccListArea().getText().equals(notRead) || v.getAccListArea().getText().equals(notDecrypt)) {
                if (getAlertDecision("iPASS - Warning",
                        "You are going to overwrite or create notes!",
                        "Continue?")
                )
                    writeFile(Model.getNotesPath(), encrypt(m.getMpwd(), v.getAccListArea().getText()));
            } else
                writeFile(Model.getNotesPath(), encrypt(m.getMpwd(), v.getAccListArea().getText()));
        } else {
            try {
                v.getGui().getFrame().setSize(200, 210);
                v.getAccListArea().setText(decrypt(m.getMpwd(), Files.readAllBytes(Paths.get(Model.getNotesPath()))));
            } catch (IOException e) {
                e.printStackTrace();
                v.getAccListArea().setText(notRead);
            } catch (DataLengthException | InvalidCipherTextException e) {
                e.printStackTrace();
                v.getAccListArea().setText(notDecrypt);
            }

            v.getAccListBtn().setText("Save");
            v.getAccListPane().setVisible(true);
        }
    }

    private void getPassword() {
        if (v.getLabel().getText().equals("Set master password!")) {
            m.setMpwd(v.getPasswordField().getText());
            v.getPasswordField().setText("");
            v.getLabel().setText("Choose Account!");
            v.getGui().alignCenter(v.getLabel());
            v.getShowBtn().setVisible(true);
            v.getAccListBtn().setVisible(true);
            v.getGui().getFrame().setSize(200, 120);
        } else {
            String salt = v.getPasswordField().getText();
            copyToClipBoard(getPwd(salt + m.getMpwd(), Model.getMpwdLen()));

            m.getTimer().schedule(SystemUtils.genTimerTask(() -> copyToClipBoard("")), Model.getDelayClearCB());

            v.getPasswordField().setText("");
            v.getGui().getFrame().setVisible(false);
        }
    }
}
