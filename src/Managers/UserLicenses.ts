import bcrypt from 'bcrypt';
import path from 'path';

const filePath = path.join(__dirname, './Licenses.json');

export class LicensesManager {
    constructor(platform) {
        switch (platform) {
            case 'arkasphere':
                this.filePath = path.join(__dirname, './credentials/arkasphere/accounts.json');
            break;
            // case 'server':
            //     this.filePath = path.join(__dirname, './Servers.json');
            //     break;
            default:
                throw new Error('Invalid platform type');
        }

        this.usersData = this.readJSONFile();
    }
    readJSONFile() {
        try {
            const jsonData = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(jsonData);
        } catch (error) {
            // If the file doesn't exist or is empty, return an empty array
            return [];
        }
    }

    writeJSONFile(data) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
    async hashSecureKeys() {
        const users = this.readJSONFile();
        for (const user of users) {
            if (!user.Password) {
                const hashedPassword = await bcrypt.hash(user.PlainPassword, 10); // 10 times hashing
                user.Password = hashedPassword;
                delete user.PlainPassword; // Remove the plain text password
            }
        }
        this.writeJSONFile(users);
    }

    async getUUID(UUID) {
        const user = this.usersData.find(u => u.UUID === UUID);
        if (!user) {
            return null; // User not found
        }
        // Omitting the PlainKey field before returning the user
        const userCopy = { ...user };
        delete userCopy.PlainKey;
        return userCopy;
    }


}

