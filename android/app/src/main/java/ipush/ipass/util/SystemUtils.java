package ipush.ipass.util;

import android.content.Context;
import android.widget.Toast;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

public class SystemUtils {

    private final Context ctx;

    public SystemUtils(Context ctx) {
        this.ctx = ctx;
    }

    public void showMsg(String msg) {
        Toast.makeText(ctx, msg, Toast.LENGTH_SHORT).show();
    }

    public void copyToClipBoard(String str) {
        android.content.ClipboardManager clipMan = (android.content.ClipboardManager) ctx.getSystemService(Context.CLIPBOARD_SERVICE);
        android.content.ClipData clipData = android.content.ClipData.newPlainText(null, str);
        clipMan.setPrimaryClip(clipData);
    }

    public void writeFile(String filename, byte[] data) {
        try {
            FileOutputStream fout = ctx.openFileOutput(filename, Context.MODE_PRIVATE);
            fout.write(data);
            fout.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public byte[] readFile(String filename) throws IOException {
        FileInputStream fin = ctx.openFileInput(filename);
        byte[] data = new byte[fin.available()];
        fin.read(data);
        return data;
    }
}
