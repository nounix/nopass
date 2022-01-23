#ifndef PWDGENPRO_H
#define PWDGENPRO_H

#include <string>

#include <QApplication>

class PwdGenPro:public QObject
{
    Q_OBJECT

public:
    // Constructor
    PwdGenPro();
    // Read from file
    std::string readFile(QString path);
    // Write to file
    void wirteFile(QString path, std::string data);
    // Check if file exits
    bool fileExists(QString path);
    // Get data from inputbox
    std::string getInput(std::string text);
    // Set, Get, Encrypt and Decrypt the Master Password
    std::string checkMasterPwd();
    // Hash and encode pwd
    std::string getPwd(std::string input, std::string mPwd, size_t length);
  
private slots:  
    void quitApp();
};

#endif // PWDGENPRO_H
