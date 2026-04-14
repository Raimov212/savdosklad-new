; SavdoSklad Inno Setup Installer Script
; Inno Setup: https://jrsoftware.org/isinfo.php (bepul yuklab olish mumkin)
; Bu faylni Inno Setup Compiler da oching va Compile bosing

[Setup]
AppName=SavdoSklad
AppVersion=1.0
AppPublisher=SavdoSklad
DefaultDirName={autopf}\SavdoSklad
DefaultGroupName=SavdoSklad
OutputDir=..\installer_output
OutputBaseFilename=SavdoSklad-Setup
Compression=lzma2
SolidCompression=yes
SetupIconFile=
ArchitecturesInstallIn64BitMode=x64
WizardStyle=modern
DisableProgramGroupPage=yes
PrivilegesRequired=lowest

[Languages]
Name: "russian"; MessagesFile: "compiler:Languages\Russian.isl"

[Files]
; Asosiy .exe fayl
Source: "..\SavdoSklad-Desktop.exe"; DestDir: "{app}"; Flags: ignoreversion

; Konfiguratsiya
Source: ".env"; DestDir: "{app}"; Flags: onlyifdoesntexist

; Migratsiyalar (DB tuzilmasini yaratish uchun)
Source: "..\migrations\*.sql"; DestDir: "{app}\migrations"; Flags: ignoreversion

; Qo'llanma
Source: "README.md"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
; Ish stoli va Start Menu da yorliq
Name: "{autodesktop}\SavdoSklad"; Filename: "{app}\SavdoSklad-Desktop.exe"
Name: "{group}\SavdoSklad"; Filename: "{app}\SavdoSklad-Desktop.exe"
Name: "{group}\README"; Filename: "{app}\README.md"

[Run]
; O'rnatishdan keyin dasturni ishga tushirish
Filename: "{app}\SavdoSklad-Desktop.exe"; Description: "SavdoSklad ni ishga tushirish"; Flags: nowait postinstall skipifsilent
