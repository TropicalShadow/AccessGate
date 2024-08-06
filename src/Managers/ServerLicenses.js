const bcrypt = require('bcrypt');
// const userDataPath = require('./Credentials.json'); // New Path

// const filePath = path.join(__dirname, './Licenses.json');

class LicensesManager {
    constructor(platform) {
        switch (platform) {
            case 'mcuniversal':
                this.filePath = path.join(__dirname, './credentials/mcuniversal/ServerLicenses.json');  
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
        for (let user of users) {
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


(async () => {
    try {
        const userDB = new LicenseManager();
        await userDB.hashSecureKeys();
    } catch (error) {
        console.error("Error hashing passwords:", error);
    }
})();


module.exports = LicensesManager;
