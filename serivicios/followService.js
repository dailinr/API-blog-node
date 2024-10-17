const Follow = require("../modelos/Follow");

const followUserIds = async(identityUserId) => {

    try{
        // Sacar información de seguimiento
        let query = Follow.find({
            "user": identityUserId
        })
        .select({"followed": 1, "_id": 0});

        let following = await query.exec();

        // ---------------- ------
        let query_ = Follow.find({
            "followed": identityUserId
        })
        .select({"user": 1, "_id": 0});

        let followers = await query_.exec();

        // Procesar array de identificadores
        let followingClean = [];

        following.forEach(follow => {
            followingClean.push(follow.followed); // array de usuarios que sigue
        });

        let followersClean = [];

        followers.forEach(follow => {
            followersClean.push(follow.user); // array de usuarios que le siguen
        })

        return {
            following: followingClean,
            followers: followersClean
        }

    }catch(error){
        return {};
    }
}

const followThisUser = async(identityUserId, profileUserId) => {

}

module.exports = {
    followUserIds
}