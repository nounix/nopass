#include "pwdGenPro.h"

#include <vector>

#include <QApplication>
#include <QtCore>
#include <QInputDialog>
#include <QClipboard>

#include <cryptopp/sha3.h>
#include <cryptopp/base64.h>

#include "cryptopp/cryptlib.h"
using CryptoPP::Exception;

#include "cryptopp/hex.h"
using CryptoPP::HexEncoder;
using CryptoPP::HexDecoder;

#include "cryptopp/filters.h"
using CryptoPP::StringSink;
using CryptoPP::StringSource;
using CryptoPP::StreamTransformationFilter;

#include "cryptopp/aes.h"
using CryptoPP::AES;

#include "cryptopp/ccm.h"
using CryptoPP::CBC_Mode;

PwdGenPro::PwdGenPro()
{
	// Change the length of the pwd
	size_t pwdLength = 12;
	// Change the clear clipboard time in sec
	int clearClipboard = 10;

	std::string mPwd = checkMasterPwd();

	if(mPwd == "created") mPwd = checkMasterPwd();

	std::string input = getInput("Choose Account!");

	std::string pwd = getPwd(input, mPwd, pwdLength);

	QApplication::clipboard() -> setText(QString::fromStdString(pwd));

	QTimer::singleShot(clearClipboard * 1000, this, SLOT(quitApp()));
}

void PwdGenPro::quitApp()
{
    QCoreApplication::quit();
}

std::string PwdGenPro::readFile(QString path)
{   
    QFile file(path);

    if(!file.open(QIODevice::ReadOnly))
        return std::string();

    QTextStream instream(&file);
    QString line = instream.readLine();

    file.close();
    
    return line.toStdString();
}

void PwdGenPro::wirteFile(QString path, std::string data)
{
    QFile file(path);

    if(!file.open(QIODevice::WriteOnly))
        return;

    QTextStream outstream(&file);
    outstream <<  QString::fromStdString(data);

    file.close();
}

bool PwdGenPro::fileExists(QString path)
{
    QFileInfo checkFile(path);
    return checkFile.exists() && checkFile.isFile();
}

std::string PwdGenPro::getInput(std::string text)
{   
    bool ok;
    QString input = QInputDialog::getText(NULL, "PwdGenPro (c) iPUSH", QString::fromStdString(text),
                                        QLineEdit::Password, NULL, &ok);
    if (ok && !input.isEmpty())
        return input.toStdString();
    else
        return std::string();
}

std::string PwdGenPro::checkMasterPwd()
{
    std::string sKey = readFile("/var/lib/dbus/machine-id");
    std::string sIV = sKey;

    std::vector<byte> key(sKey.begin(), sKey.end());
    std::vector<byte> iv(sIV.begin(), sIV.end());

    std::string encrypted, encoded, decoded, decrypted;

    QString path = QCoreApplication::applicationDirPath() + "/.pwdGenPro";

    if (fileExists(path)){
        encoded = readFile(path);

        StringSource(encoded, true, new HexDecoder(new StringSink(decoded)));
        
        CBC_Mode< AES >::Decryption d;
        d.SetKeyWithIV(key.data(), key.size(), iv.data());

        StringSource(decoded, true, new StreamTransformationFilter(d, new StringSink(decrypted)));
        
        return decrypted;
    }

    else{
        std::string input = getInput("Set Master Password!");

        CBC_Mode< AES >::Encryption e;
        e.SetKeyWithIV(key.data(), key.size(), iv.data());
        
        StringSource(input, true, new StreamTransformationFilter(e, new StringSink(encrypted)));

        StringSource(encrypted, true, new HexEncoder( new StringSink(encoded)));

        wirteFile(path, encoded);

        return "created";
    }
}

std::string PwdGenPro::getPwd(std::string input, std::string mPwd, size_t length)
{
    CryptoPP::SHA3_512 hash;
    byte digest[CryptoPP::SHA3_512::DIGESTSIZE];

    std::string salt = input + mPwd;

    hash.CalculateDigest(digest,(const byte *)salt.c_str(),salt.size());
    
    CryptoPP::Base64Encoder encoder;
    std::string output;
  
    CryptoPP::StringSink *SS = new CryptoPP::StringSink(output);
    encoder.Attach(SS);
    encoder.Put(digest,sizeof(digest));
    encoder.MessageEnd();
    
    std::string table;

    for(int i = 48; i <= 57; i++) { table += (char)i; }		// Numbers 48 - 57
    for(int i = 65; i <= 90; i++) { table += (char)i; }		// Capital letters 65 - 90
    for(int i = 97; i <= 122; i++) { table += (char)i; }	// Small letters 97 - 122

    for(unsigned int i = 0; i < output.length(); i++){
        if(table.find(output[i]) == std::string::npos){     
            output.erase(i,1);
        }
    }
    
    output.resize(length);

    return output;
}
