package ipush.ipass;

import android.os.Bundle;
import android.os.Handler;
import android.support.v7.app.AlertDialog;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import org.bouncycastle.crypto.DataLengthException;
import org.bouncycastle.crypto.InvalidCipherTextException;

import java.io.IOException;

import ipush.ipass.util.SystemUtils;

import static ipush.ipass.util.Crypto.decrypt;
import static ipush.ipass.util.Crypto.encrypt;
import static ipush.ipass.util.Crypto.getPwd;

public class MainActivity extends AppCompatActivity {

    private String mpwd;
    private static final int mpwdLen = 12;
    private static final String notesPath = "iPASS.bin";

    private final Handler timer = new Handler();
    private static final int delayClearCB = 10000;

    private SystemUtils systemUtils;

    private TextView label;
    private EditText passwordField;
    private EditText fieldNotes;
    private Button btnPwd;
    private Button btnNotes;
    private AlertDialog.Builder builder;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        systemUtils = new SystemUtils(getApplicationContext());

        label = findViewById(R.id.textView);
        passwordField = findViewById(R.id.editTextPassword);
        fieldNotes = findViewById(R.id.editTextNotes);
        btnPwd = findViewById(R.id.buttonPassword);
        btnNotes = findViewById(R.id.buttonNotes);

        // Show password
        btnPwd.setOnClickListener(v -> togglePassword());

        // Show encrypted notes
        btnNotes.setOnClickListener(v -> toggleNotes());

        // Password editor
        passwordField.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_DONE) {
                getPassword();
                return true;
            }
            return false;
        });

        // Alert dialog check if overwrite or create notes
        builder = new AlertDialog.Builder(MainActivity.this);
        builder.setTitle(getString(R.string.alert_title));
        builder.setMessage(getString(R.string.alert_message));
        builder.setPositiveButton(getString(R.string.alert_positive), (dialog, which) -> systemUtils.writeFile(notesPath, encrypt(mpwd, fieldNotes.getText().toString())));
        builder.setNegativeButton(getString(R.string.alert_negative), null);
    }

    private void togglePassword() {
        if (label.getText().equals(getString(R.string.label_account))) {
            label.setText(getPwd(passwordField.getText().toString() + mpwd, mpwdLen));
            btnPwd.setText(R.string.btn_pwd_hide);
        } else {
            label.setText(R.string.label_account);
            btnPwd.setText(R.string.btn_pwd_show);
        }
    }

    private void toggleNotes() {
        String notRead = getString(R.string.error_file);
        String notDecrypt = getString(R.string.error_decrypt);

        if (fieldNotes.getVisibility() == View.VISIBLE) {
            btnNotes.setText(R.string.btn_notes_show);
            fieldNotes.setVisibility(View.INVISIBLE);

            if (fieldNotes.getText().toString().equals(notRead) || fieldNotes.getText().toString().equals(notDecrypt)) {
                builder.show();
            } else
                systemUtils.writeFile(notesPath, encrypt(mpwd, fieldNotes.getText().toString()));
        } else {
            try {
                fieldNotes.setText(decrypt(mpwd, systemUtils.readFile(notesPath)));
            } catch (IOException e) {
                e.printStackTrace();
                fieldNotes.setText(notRead);
            } catch (DataLengthException | InvalidCipherTextException e) {
                e.printStackTrace();
                fieldNotes.setText(notDecrypt);
            }

            btnNotes.setText(R.string.btn_notes_save);
            fieldNotes.setVisibility(View.VISIBLE);
        }
    }

    private void getPassword() {
        if (label.getText().equals(getString(R.string.label_master))) {
            mpwd = passwordField.getText().toString();
            passwordField.setText("");
            label.setText(R.string.label_account);
            btnPwd.setVisibility(View.VISIBLE);
            btnNotes.setVisibility(View.VISIBLE);
        } else {
            String salt = passwordField.getText().toString();
            systemUtils.copyToClipBoard(getPwd(salt + mpwd, mpwdLen));

            timer.postDelayed(() -> systemUtils.copyToClipBoard(""), delayClearCB);

            passwordField.setText("");
            systemUtils.showMsg(getString(R.string.cb_copy));
        }
    }
}
