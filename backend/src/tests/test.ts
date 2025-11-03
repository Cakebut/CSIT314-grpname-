const { UserEntity } = require("../entities/userAccount");

 



describe('Create new user account', () => {
    //let db: DrizzleClient
    //let pgPool: Pool

    it('should succeed with valid fields', async () => {
        const createSuccess = await new UserEntity().createUserFunc(
            "username","password",1
        );
        expect(createSuccess).toBe(true);
    });

    it('should fail with invalid role', async () => {
        const createSuccess = await new UserEntity().createUserFunc(
            "username","password",67
        );
        expect(createSuccess).toBe(false);
    });
});



//create new user
