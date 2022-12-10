const { Schema, model } = require ('mongoose');

const dataUser = new Schema ({
    email: {type: String, required: true},
    password: {type: String, required: true},
    direccion: {type: String, required: true},
},{timestamps: true});


dataUser.methods.encrypPassword = async password =>{
    const salt = await bcrypt.gentSalt(10);
    return await  bcrypt.hahs(password, salt);
};

dataUser.methods.matchPassword = async function (password){
    return await bcrypt.compare(password, this.password)
}


module.exports = model ('dataUser', dataUser);