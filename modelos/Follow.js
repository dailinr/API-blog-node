const {Schema, model} = require("mongoose");
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');


const FollowSchema = Schema({
    // usuario que sigue a
    user: {
        type: Schema.ObjectId,
        ref: "User"
    },
    followed: {
        type: Schema.ObjectId,
        ref: "User" 
    },
    created_at:{
        type: Date,
        default: Date.now()
    }
});


// Aplicar el plugin de paginación al esquema
FollowSchema.plugin(mongoosePaginate);

module.exports = model("follow", FollowSchema, "follows");