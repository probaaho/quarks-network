async function enrollAdmin(FabricCAServices, FileSystemWallet, X509WalletMixin, path, caUrl, walletPathStr, adminUserName, adminSecret, mspId) {
    try {

        // Create a new CA client for interacting with the CA.
        const ca = new FabricCAServices(caUrl);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), walletPathStr);
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists(adminUserName);
        if (adminExists) {
            console.log(`An identity for the admin user ${adminUserName} already exists in the wallet`);
            return false;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({
            enrollmentID: adminUserName,
            enrollmentSecret: adminSecret
        });
        const identity = X509WalletMixin.createIdentity(
            mspId,
            enrollment.certificate,
            enrollment.key.toBytes()
        );

        await wallet.import(adminUserName, identity);
        console.log(`Successfully enrolled admin user "${adminUserName}" and imported it into the wallet`);
        return true;

    } catch (error) {
        console.error(`Failed to enroll admin user "${adminUserName}": ${error}`);
        return false;
    }
}


module.exports = {
    enrollAdmin
}

