const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
// const UserManager = require('../../AccessGate/src/UserManager');

// const filePath = path.join(__dirname, './Credentials.json');

class PlatformManagers {
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
            const jsonData = fs.readFileSync(this.filePath, 'utf8');
            return JSON.parse(jsonData);
        } catch (error) {
            // If the file doesn't exist or is empty, return an empty array
            return [];
        }
    }

    writeJSONFile(data) {
        fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    }

    async hashPasswords() {
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

    async getUserByUsername(username) {
        const users = this.readJSONFile();
        const user = users.find(u => u.Username === username);
        if (!user) {
            return null; // User not found
        }
        const userCopy = { ...user };
        delete userCopy.PlainPassword;
        return userCopy;
    }

    async fetchUserData(UUID) {
        try {
            const email = await this.getInformationByUUID(UUID, 'Email');
            const username = await this.getInformationByUUID(UUID, 'Username');
            const created = await this.getInformationByUUID(UUID, 'Created');
            const avatar = await this.getInformationByUUID(UUID, 'Avatar');

            return {
                email,
                username,
                created,
                avatar
            };
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    }

    async wipeData(username) {
        const users = this.readJSONFile();
        const user = users.find(user => user.Username === username);
        if (user) {
            user.SessionToken = "Not Signed in";
            user.SessionID = "Not signed in";
            user.InstanceToken = "Not signed in";

            this.writeJSONFile(users);
            return true;
        } else {
            throw new Error(`User '${username}' not found.`);
        }
    }

    async createSessionToken(username) {
        const sessionToken = this.characterGenerator(24, true, true);

        const users = this.readJSONFile();
        const user = users.find(user => user.Username === username);
        if (user) {
            user.SessionToken = sessionToken;
            this.writeJSONFile(users);
            return sessionToken;
        } else {
            throw new Error(`User '${username}' not found.`);
        }
    }

    async createInstanceToken(username) {
        const instanceToken = this.characterGenerator(16, true, true);

        const users = this.readJSONFile();
        const user = users.find(user => user.Username === username);
        if (user) {
            user.InstanceToken = instanceToken;
            this.writeJSONFile(users);
            return instanceToken;
        } else {
            throw new Error(`User '${username}' not found.`);
        }
    }

    async createSessionID(username) {
        const sessionID = this.characterGenerator(6, true, true);

        const users = this.readJSONFile();
        const user = users.find(user => user.Username === username);
        if (user) {
            user.SessionID = sessionID;
            this.writeJSONFile(users);
            return sessionID;
        } else {
            throw new Error(`User '${username}' not found.`);
        }
    }

    async getInformationByUUID(UUID, info) {
        const users = this.readJSONFile();
        const user = users.find(user => user.UUID === UUID);
        if (user) {
            return user[info];
        } else {
            throw new Error(`User with UUID '${UUID}' not found.`);
        }
    }

    async getUUIDbyUsername(username) {
        const users = this.readJSONFile();
        const user = users.find(user => user.Username === username);
        if (user) {
            return user.UUID;
        } else {
            throw new Error(`User '${username}' not found.`);
        }
    }

    async getEmailByUUID(UUID) {
        const users = this.readJSONFile();
        const user = users.find(user => user.UUID === UUID);
        if (user) {
            return user.Email;
        } else {
            throw new Error(`User with UUID '${UUID}' not found.`);
        }
    }

    async createToken() {
        const UUID = this.characterGenerator(32, true, true);

        const users = this.readJSONFile();
        users.forEach(user => user.UUID = UUID);
        this.writeJSONFile(users);

        return UUID;
    }

    async fetchType(username, targetType) {
        try {
            const users = this.readJSONFile();
            const user = users.find(user => user.Username === username);

            if (user) {
                if (user[targetType] !== undefined) {
                    return user[targetType];
                } else {
                    const newPUID = await this.createPUID(username, targetType);
                    return newPUID;
                }
            } else {
                throw new Error(`User '${username}' not found.`);
            }
        } catch (error) {
            throw new Error(`Error fetching ${targetType} for Username '${username}': ${error.message}`);
        }
    }

    async createPUID(username, targetType) {
        try {
            const UUID = this.characterGenerator(64, true, true);

            let users = this.readJSONFile();

            const userIndex = users.findIndex(user => user.Username === username);
            if (userIndex !== -1) {
                users[userIndex][targetType] = UUID;
                this.writeJSONFile(users);
                return UUID;
            } else {
                throw new Error(`User '${username}' not found.`);
            }
        } catch (error) {
            throw new Error(`Error creating ${targetType} for Username '${username}': ${error.message}`);
        }
    }

    async createUUID() {
        const UUID = this.characterGenerator(32, true, true);

        const users = this.readJSONFile();
        users.forEach(user => user.UUID = UUID);
        this.writeJSONFile(users);

        return UUID;
    }

    async checkUserTokens(SessionToken, SessionID) {
        const user = this.usersData.find(user => user.SessionToken === SessionToken && user.SessionID === SessionID);
    
        if (!user) {
            console.log("Invalid tokens provided:");
            console.log("Provided SessionToken:", SessionToken);
            console.log("Provided SessionID:", SessionID);
            console.log("No matching user found with these tokens.");
            return false;
        }
    
        return true;
    }

    characterGenerator(length, useNumbers, useLetters) {
        const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
        const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbersChars = "0123456789";

        let allowedCharacters = "";
        let password = "";

        allowedCharacters += useLetters ? lowercaseChars + uppercaseChars : "";
        allowedCharacters += useNumbers ? numbersChars : "";

        if (length <= 0) {
            return "Password length must be greater than 0";
        }

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * allowedCharacters.length);
            password += allowedCharacters[randomIndex];
        }

        return password;
    }
}

(async () => {
    try {
        const userManager = new UserManager()
        await userManager.hashPasswords();
    } catch (error) {
        console.error("Error hashing passwords:", error);
    }
})();

module.exports = PlatformManagers;
