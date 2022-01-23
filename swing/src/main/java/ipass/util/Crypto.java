package ipass.util;

import org.bouncycastle.crypto.DataLengthException;
import org.bouncycastle.crypto.InvalidCipherTextException;
import org.bouncycastle.jcajce.provider.digest.Keccak;
import org.bouncycastle.util.encoders.Base64;
import org.bouncycastle.util.encoders.Hex;

public class Crypto {

    public static String getPwd(String input, int length) {
        String sha3 = new String(Base64.encode(
                new Keccak.Digest512().digest(input.getBytes()))
        );

        StringBuilder pwd = new StringBuilder();
        StringBuilder table = new StringBuilder();

        for (int i = 48; i <= 57; i++) table.append((char) i);    // Numbers 48 - 57
        for (int i = 65; i <= 90; i++) table.append((char) i);    // Capital letters 65 - 90
        for (int i = 97; i <= 122; i++) table.append((char) i);   // Small letters 97 - 122

        for (char chr : sha3.toCharArray()) {
            if (table.toString().indexOf(chr) != -1) pwd.append(chr);
            if (pwd.length() >= length) return pwd.toString();
        }

        return "";
    }

    public static byte[] encrypt(String mpwd, String input) {
        CBCAESBouncyCastle cabc = CBCAESBouncyCastle.getBC(mpwd);

        try {
            byte[] encr = cabc.encrypt(input.getBytes());
            return Hex.encode(encr);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public static String decrypt(String mpwd, byte[] input) throws DataLengthException, InvalidCipherTextException {
        CBCAESBouncyCastle cabc = CBCAESBouncyCastle.getBC(mpwd);
        return new String(cabc.decrypt(Hex.decode(input)));
    }
}
