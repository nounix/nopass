#include "pwdGenPro.h"

#include <memory>

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);

    std::unique_ptr<PwdGenPro> pwdGen(new PwdGenPro);
  
    return app.exec();
}