import re

with open(r"e:\FinalProjects\techwell-lms\frontend\app\admin\settings\page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

if "QrCode" not in content:
    content = content.replace("User } from 'lucide-react'", "User, QrCode, Shield } from 'lucide-react'")

if "const [qrCodeUrl" not in content:
    state_code = """
    // 2FA State
    const [qrCodeUrl, setQrCodeUrl] = React.useState<string | null>(null)
    const [twoFaCode, setTwoFaCode] = React.useState('')
    const [is2FaEnabled, setIs2FaEnabled] = React.useState(false)
"""
    content = content.replace("const [systemSettings, setSystemSettings] = React.useState({", state_code + "\n    const [systemSettings, setSystemSettings] = React.useState({")

if "setIs2FaEnabled(userRes.data.twoFactorEnabled || false)" not in content:
    content = content.replace("setAvatarPreview(userRes.data.avatar", "setIs2FaEnabled(userRes.data.twoFactorEnabled || false)\n            setAvatarPreview(userRes.data.avatar")

if "handleSetup2FA" not in content:
    functions_code = """
    const handleSetup2FA = async () => {
        try {
            const res = await api.post('/auth/2fa/setup')
            setQrCodeUrl(res.data.data.qrCodeUrl)
        } catch (error) {
            console.error(error)
            alert('Failed to setup 2FA')
        }
    }

    const handleEnable2FA = async () => {
        try {
            await api.post('/auth/2fa/enable', { token: twoFaCode })
            setIs2FaEnabled(true)
            setQrCodeUrl(null)
            setTwoFaCode('')
            alert('2FA enabled successfully!')
        } catch (error) {
            console.error(error)
            alert('Invalid 2FA code')
        }
    }
"""
    content = content.replace("const handleSaveProfile = async () => {", functions_code + "\n    const handleSaveProfile = async () => {")

security_card = """
                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-indigo-500" />
                            Security Settings
                        </CardTitle>
                        <CardDescription>Secure your account with Two-Factor Authentication.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between border p-4 rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="text-base font-semibold">Two-Factor Authentication (2FA)</Label>
                                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {is2FaEnabled ? (
                                    <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">Enabled</span>
                                ) : (
                                    <Button onClick={handleSetup2FA} variant="outline" size="sm">Setup 2FA</Button>
                                )}
                            </div>
                        </div>

                        {qrCodeUrl && !is2FaEnabled && (
                            <div className="mt-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-2">
                                <div className="text-center">
                                    <h4 className="font-semibold text-sm">Scan QR Code</h4>
                                    <p className="text-xs text-muted-foreground">Use Google Authenticator or Authy to scan this code.</p>
                                </div>
                                <div className="bg-white p-2 rounded-xl shadow-sm border">
                                    <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                                </div>
                                <div className="w-full max-w-xs space-y-2">
                                    <Label className="text-xs">Enter 6-digit code</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            value={twoFaCode}
                                            onChange={(e) => setTwoFaCode(e.target.value)}
                                            placeholder="000000"
                                            maxLength={6}
                                            className="text-center tracking-widest font-mono font-bold"
                                        />
                                        <Button onClick={handleEnable2FA} disabled={twoFaCode.length !== 6}>Verify</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
"""
if "Security Settings" not in content:
    content = content.replace("{/* Platform Settings */}", security_card + "\n                {/* Platform Settings */}")

with open(r"e:\FinalProjects\techwell-lms\frontend\app\admin\settings\page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("2FA Settings added!")
