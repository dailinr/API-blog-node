const Follow = require("../modelos/Follow");

const followUserIds = async(identityUserId) => {

    try{
        // Sacar información de seguimiento
        let query = Follow.find({
            "user": identityUserId
        })
        .select({"followed": 1, "_id": 0});

        let following = await query.exec();

        // ----------------------
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

// Comprobar si sigo a un usuario y si ese usuario me sigue
const followThisUser = async(identityUserId, profileUserId) => {
    
    let following = await Follow.findOne({
        "user": identityUserId,
        "followed": profileUserId // verifica si lo sigo
    });

    // ----------------------
    let follower = await Follow.findOne({
        "user": profileUserId, // verifica si me sigue
        "followed": identityUserId
    });

    return {
        following,
        follower
    }
}

const saveFollow = async(userId, followedId) => {    

    try {
        const follow = new Follow({ user: userId, followed: followedId });
        return await follow.save();
    } 
    catch (error) {
        throw new Error("Error al guardar el seguimiento: " + error.message);
    }
}

module.exports = {
    followUserIds,
    followThisUser,
    saveFollow
}