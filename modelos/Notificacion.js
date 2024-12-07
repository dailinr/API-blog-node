const {Schema, model} = require("mongoose");
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const NotiSchema = Schema({
    // usuario que recibe la noti
    user: {
        type: Schema.ObjectId,
        ref: "User"
    },
    seguidor : {
        type: Schema.ObjectId,
        ref: "User"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

NotiSchema.plugin(mongoosePaginate);

module.exports = model("notificacion", NotiSchema, "notificaciones");