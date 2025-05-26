"use client";
import type React from "react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Copy,
  Download,
  Key,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  QrCode,
  Save,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/providers/auth-provider";
import QRCode from "react-qr-code";
import UploadAvatar from "@/components/profile/profile-view/actions/my/upload-avatar";
import { cn } from "@/lib/utils";

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Email change state
  const [email, setEmail] = useState(user?.email || "");
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);

  // Passkeys state
  const [passkeys, setPasskeys] = useState([
    { id: "passkey-1", name: "MacBook Pro", lastUsed: "2 days ago" },
    { id: "passkey-2", name: "iPhone 15", lastUsed: "5 hours ago" },
  ]);
  const [registeringPasskey, setRegisteringPasskey] = useState(false);

  // Backup state
  const [lastBackup, setLastBackup] = useState<string | null>("March 15, 2025");
  const [backupInProgress, setBackupInProgress] = useState(false);

  // Handle email change
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailChangeLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Email updated successfully");
    } catch (error) {
      toast.error("Failed to update email");
    } finally {
      setEmailChangeLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don&apos;t match");
      return;
    }

    setPasswordChangeLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Failed to update password");
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  // Handle 2FA toggle
  const handleToggle2FA = async () => {
    if (!twoFactorEnabled) {
      // Enable 2FA flow
      setShowQRCode(true);
      // In a real app, you would fetch the QR code data from your backend
    } else {
      // Disable 2FA flow
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setTwoFactorEnabled(false);
        setShowQRCode(false);
        toast.success("Two-factor authentication disabled");
      } catch (error) {
        toast.error("Failed to disable two-factor authentication");
      }
    }
  };

  // Handle 2FA verification
  const handleVerify2FA = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate fake recovery codes
      const codes = Array.from(
        { length: 8 },
        () =>
          Math.random().toString(36).substring(2, 6) +
          "-" +
          Math.random().toString(36).substring(2, 6) +
          "-" +
          Math.random().toString(36).substring(2, 6)
      );

      setRecoveryCodes(codes);
      setShowRecoveryCodes(true);
      setTwoFactorEnabled(true);
      toast.success("Two-factor authentication enabled");
    } catch (error) {
      toast.error("Invalid verification code");
    }
  };

  // Handle adding a new passkey
  const handleAddPasskey = async () => {
    setRegisteringPasskey(true);

    try {
      // Simulate WebAuthn registration
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Add new passkey to the list
      const newPasskey = {
        id: `passkey-${passkeys.length + 1}`,
        name: "New Device",
        lastUsed: "Just now",
      };

      setPasskeys([...passkeys, newPasskey]);
      toast.success("Passkey registered successfully");
    } catch (error) {
      toast.error("Failed to register passkey");
    } finally {
      setRegisteringPasskey(false);
    }
  };

  // Handle removing a passkey
  const handleRemovePasskey = async (id: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Remove passkey from the list
      setPasskeys(passkeys.filter((passkey) => passkey.id !== id));
      toast.success("Passkey removed successfully");
    } catch (error) {
      toast.error("Failed to remove passkey");
    }
  };

  // Handle creating a backup
  const handleCreateBackup = async () => {
    setBackupInProgress(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const now = new Date();
      setLastBackup(
        now.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );

      toast.success("Backup created successfully");
    } catch (error) {
      toast.error("Failed to create backup");
    } finally {
      setBackupInProgress(false);
    }
  };

  // Handle restoring from backup
  const handleRestoreBackup = async () => {
    // In a real app, you would open a file picker and upload the backup file
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
        toast.success("Backup restored successfully");
      } catch (error) {
        toast.error("Failed to restore backup");
      }
    };

    input.click();
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Settings tabs */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="profile">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Email</span>
                </TabsTrigger>
                <TabsTrigger value="password">
                  <Lock className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Password</span>
                </TabsTrigger>
                <TabsTrigger value="passkeys">
                  <KeyRound className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Passkeys</span>
                </TabsTrigger>
                <TabsTrigger value="2fa">
                  <Shield className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">2FA</span>
                </TabsTrigger>
                <TabsTrigger value="backup">
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Backup</span>
                </TabsTrigger>
              </TabsList>

              {/* Email Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Address</CardTitle>
                    <CardDescription>Update your email address</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleEmailChange}>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                            required
                          />
                        </div>
                        <div className="flex flex-row items-center justify-start gap-2">
                          <h1 className="font-semibold">Status:</h1>
                          <p
                            className={cn(
                              user?.emailVerified
                                ? "text-green-500"
                                : "text-red-500"
                            )}>
                            {user?.emailVerified ? "Verified" : "Not Verified"}
                          </p>
                        </div>
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Important</AlertTitle>
                          <AlertDescription>
                            Changing your email will require verification of the
                            new address.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      onClick={handleEmailChange}
                      disabled={emailChangeLoading || email === user?.email}>
                      {emailChangeLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Password Tab */}
              <TabsContent value="password">
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>Change your password</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordChange}>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="current-password">
                            Current Password
                          </Label>
                          <Input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="confirm-password">
                            Confirm New Password
                          </Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handlePasswordChange}
                      disabled={
                        passwordChangeLoading ||
                        !currentPassword ||
                        !newPassword ||
                        !confirmPassword ||
                        newPassword !== confirmPassword
                      }>
                      {passwordChangeLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Passkeys Tab */}
              <TabsContent value="passkeys">
                <Card>
                  <CardHeader>
                    <CardTitle>Passkeys</CardTitle>
                    <CardDescription>
                      Manage your passkeys for passwordless authentication
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <Alert>
                        <KeyRound className="h-4 w-4" />
                        <AlertTitle>About Passkeys</AlertTitle>
                        <AlertDescription>
                          Passkeys are a more secure alternative to passwords.
                          They use biometric data or device PIN to authenticate
                          you.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Your Passkeys</h3>
                        {passkeys.length > 0 ? (
                          <div className="space-y-2">
                            {passkeys.map((passkey) => (
                              <div
                                key={passkey.id}
                                className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Key className="h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">
                                      {passkey.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Last used: {passkey.lastUsed}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleRemovePasskey(passkey.id)
                                  }>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-4 border rounded-lg">
                            <p className="text-muted-foreground">
                              No passkeys registered
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={handleAddPasskey}
                      disabled={registeringPasskey}>
                      {registeringPasskey ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <KeyRound className="mr-2 h-4 w-4" />
                          Register New Passkey
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* 2FA Tab */}
              <TabsContent value="2fa">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Two-Factor Authentication</CardTitle>
                        <CardDescription>
                          Add an extra layer of security to your account
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={twoFactorEnabled}
                          onCheckedChange={handleToggle2FA}
                        />
                        <span className="text-sm font-medium">
                          {twoFactorEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!twoFactorEnabled && !showQRCode && (
                      <div className="space-y-4">
                        <Alert>
                          <ShieldAlert className="h-4 w-4" />
                          <AlertTitle>Enhance Your Security</AlertTitle>
                          <AlertDescription>
                            Two-factor authentication adds an additional layer
                            of security to your account by requiring a code from
                            your phone in addition to your password.
                          </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border rounded-lg p-4 flex flex-col items-center text-center">
                            <Smartphone className="h-8 w-8 mb-2 text-primary" />
                            <h3 className="font-medium">Authenticator App</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Use Google Authenticator, Authy, or any other TOTP
                              app
                            </p>
                          </div>
                          <div className="border rounded-lg p-4 flex flex-col items-center text-center">
                            <QrCode className="h-8 w-8 mb-2 text-primary" />
                            <h3 className="font-medium">QR Code Setup</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Scan a QR code with your authenticator app to get
                              started
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {showQRCode && !twoFactorEnabled && !showRecoveryCodes && (
                      <div className="space-y-6">
                        <div className="flex flex-col items-center">
                          <div className="bg-white p-4 rounded-lg mb-4">
                            <QRCode
                              value="otpauth://totp/Example:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example"
                              size={180}
                            />
                          </div>
                          <p className="text-sm text-center text-muted-foreground mb-4">
                            Scan this QR code with your authenticator app, or
                            enter the code manually:
                          </p>
                          <div className="flex items-center gap-2 bg-muted p-2 rounded-md mb-6">
                            <code className="text-sm font-mono">
                              JBSWY3DPEHPK3PXP
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  "JBSWY3DPEHPK3PXP"
                                );
                                toast.success("Secret copied to clipboard");
                              }}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="w-full max-w-xs space-y-2">
                            <Label htmlFor="verification-code">
                              Enter verification code
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                id="verification-code"
                                value={verificationCode}
                                onChange={(e) =>
                                  setVerificationCode(e.target.value)
                                }
                                placeholder="000000"
                                maxLength={6}
                              />
                              <Button
                                onClick={handleVerify2FA}
                                disabled={verificationCode.length !== 6}>
                                Verify
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {showRecoveryCodes && (
                      <div className="space-y-4">
                        <Alert className="bg-yellow-50 border-yellow-200">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <AlertTitle className="text-yellow-800">
                            Save your recovery codes
                          </AlertTitle>
                          <AlertDescription className="text-yellow-700">
                            Keep these recovery codes in a safe place. You can
                            use them to access your account if you lose your
                            authenticator device.
                          </AlertDescription>
                        </Alert>

                        <div className="bg-muted p-4 rounded-lg">
                          <div className="grid grid-cols-2 gap-2">
                            {recoveryCodes.map((code, index) => (
                              <code key={index} className="text-sm font-mono">
                                {code}
                              </code>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <Button
                            variant="outline"
                            onClick={() => {
                              const codes = recoveryCodes.join("\n");
                              navigator.clipboard.writeText(codes);
                              toast.success(
                                "Recovery codes copied to clipboard"
                              );
                            }}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Codes
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              const codes = recoveryCodes.join("\n");
                              const blob = new Blob([codes], {
                                type: "text/plain",
                              });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = "recovery-codes.txt";
                              a.click();
                              URL.revokeObjectURL(url);
                            }}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Codes
                          </Button>
                        </div>
                      </div>
                    )}

                    {twoFactorEnabled && !showRecoveryCodes && (
                      <div className="space-y-4">
                        <div className="flex items-center p-4 border rounded-lg">
                          <ShieldCheck className="h-6 w-6 text-green-500 mr-4" />
                          <div>
                            <h3 className="font-medium">
                              Two-factor authentication is enabled
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Your account is protected with an additional layer
                              of security.
                            </p>
                          </div>
                          <Badge className="ml-auto bg-green-100 text-green-800 hover:bg-green-100">
                            Active
                          </Badge>
                        </div>

                        <div className="border rounded-lg divide-y">
                          <div className="p-4 flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">Recovery Codes</h3>
                              <p className="text-sm text-muted-foreground">
                                View or download your recovery codes
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => setShowRecoveryCodes(true)}>
                              View Codes
                            </Button>
                          </div>
                          <div className="p-4 flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">Reset Two-Factor</h3>
                              <p className="text-sm text-muted-foreground">
                                Generate a new QR code and recovery codes
                              </p>
                            </div>
                            <Button variant="outline">Reset</Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Backup Tab */}
              <TabsContent value="backup">
                <Card>
                  <CardHeader>
                    <CardTitle>Backup & Restore</CardTitle>
                    <CardDescription>
                      Backup your account data or restore from a previous backup
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <Alert>
                        <Download className="h-4 w-4" />
                        <AlertTitle>About Backups</AlertTitle>
                        <AlertDescription>
                          Backups include your account settings, preferences,
                          and other important data. They do not include your
                          password or security credentials.
                        </AlertDescription>
                      </Alert>

                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">Last Backup</h3>
                        {lastBackup ? (
                          <p className="text-sm text-muted-foreground">
                            Your last backup was created on {lastBackup}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            You haven&apos;t created any backups yet
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <h3 className="font-medium mb-2">Create Backup</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Create a backup of your current account data
                          </p>
                          <Button
                            className="w-full"
                            onClick={handleCreateBackup}
                            disabled={backupInProgress}>
                            {backupInProgress ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Backup...
                              </>
                            ) : (
                              <>
                                <Download className="mr-2 h-4 w-4" />
                                Create Backup
                              </>
                            )}
                          </Button>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h3 className="font-medium mb-2">
                            Restore from Backup
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Restore your account data from a previous backup
                          </p>
                          <Button
                            className="w-full"
                            variant="outline"
                            onClick={handleRestoreBackup}>
                            <Upload className="mr-2 h-4 w-4" />
                            Restore Backup
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
