import re

with open(r"e:\FinalProjects\techwell-lms\frontend\app\admin\cms\page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add teamPhotoFile state
if "const [teamPhotoFile" not in content:
    content = content.replace("const [isEditing, setIsEditing] = useState(false)", "const [isEditing, setIsEditing] = useState(false)\n    const [teamPhotoFile, setTeamPhotoFile] = useState<File | null>(null)")

# Modify handleTeamSubmit
old_team_submit = """    const handleTeamSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            if (isEditing && teamForm.id) {
                await teamApi.update(teamForm.id, teamForm)
            } else {
                await teamApi.create(teamForm)
            }
            setTeamForm({ id: '', name: '', designation: '', description: '', photoUrl: '', linkedinUrl: '', orderIndex: 0, isActive: true })
            setIsEditing(false)
            loadData()
        } catch (error) {
            console.error('Failed to save team member', error)
        } finally {
            setIsSaving(false)
        }
    }"""

new_team_submit = """    const handleTeamSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            let photoUrl = teamForm.photoUrl;
            if (teamPhotoFile) {
                const formData = new FormData();
                formData.append('file', teamPhotoFile);
                const uploadRes = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                photoUrl = uploadRes.data.url;
            }

            const dataToSave = { ...teamForm, photoUrl };

            if (isEditing && teamForm.id) {
                await teamApi.update(teamForm.id, dataToSave)
            } else {
                await teamApi.create(dataToSave)
            }
            setTeamForm({ id: '', name: '', designation: '', description: '', photoUrl: '', linkedinUrl: '', orderIndex: 0, isActive: true })
            setTeamPhotoFile(null)
            setIsEditing(false)
            loadData()
        } catch (error) {
            console.error('Failed to save team member', error)
        } finally {
            setIsSaving(false)
        }
    }

    const toggleTeamMemberStatus = async (id: string, currentStatus: boolean) => {
        try {
            await teamApi.update(id, { isActive: !currentStatus })
            loadData()
        } catch (error) {
            console.error('Failed to toggle status', error)
        }
    }"""

if "let photoUrl = teamForm.photoUrl;" not in content:
    content = content.replace(old_team_submit, new_team_submit)

if "import api, {" not in content:
    content = content.replace("import { productApi", "import api, { productApi")


# Modify Photo URL input to File Input
old_photo_input = """                                    <div>
                                        <label className="text-sm font-medium">Photo URL</label>
                                        <Input value={teamForm.photoUrl} onChange={e => setTeamForm({...teamForm, photoUrl: e.target.value})} placeholder="https://..." />
                                    </div>"""

new_photo_input = """                                    <div>
                                        <label className="text-sm font-medium">Photo (500x500 px, max 2MB)</label>
                                        <Input type="file" accept="image/jpeg,image/png" onChange={e => setTeamPhotoFile(e.target.files?.[0] || null)} />
                                        {teamForm.photoUrl && !teamPhotoFile && (
                                            <p className="text-xs text-muted-foreground mt-1">Current photo URL: {teamForm.photoUrl}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">JPG or PNG format for best quality.</p>
                                    </div>"""

content = content.replace(old_photo_input, new_photo_input)

# Add Toggle Active switch to the table
old_table_headers = """                                            <TableHead>LinkedIn</TableHead>
                                            <TableHead>Actions</TableHead>"""
new_table_headers = """                                            <TableHead>LinkedIn</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>"""
content = content.replace(old_table_headers, new_table_headers)

old_table_row = """                                                <TableCell>{t.linkedinUrl && <a href={t.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Profile</a>}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">"""
new_table_row = """                                                <TableCell>{t.linkedinUrl && <a href={t.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Profile</a>}</TableCell>
                                                <TableCell>
                                                    <Switch checked={t.isActive} onCheckedChange={() => toggleTeamMemberStatus(t.id, t.isActive)} />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">"""
content = content.replace(old_table_row, new_table_row)

with open(r"e:\FinalProjects\techwell-lms\frontend\app\admin\cms\page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Team CMS Modified!")
