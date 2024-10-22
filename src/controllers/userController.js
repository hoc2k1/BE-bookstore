const userServices = require('../services/userServices')

const createUser = async (req, res) => {
    try {
        const { useName, email, password, confirmPassword, phone } = req.body;
        let reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let checkEmail = reg.test(email) ? true : false;
        if (!useName || !email || !password || !confirmPassword) {
            return res.status(200).json({
                status: 'error',
                message: 'Bạn chưa nhập đủ các trường!'
            })
        }
        else if (password != confirmPassword) {
            return res.status(200).json({
                status: 'error',
                message: 'Xác nhận mật khẩu không trùng khớp!'
            })
        }
        else if (!checkEmail) {
            return res.status(200).json({
                status: 'error',
                message: 'Email không hợp lệ!'
            })
        }
        const response = await userServices.createUser()
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

module.exports = {
    createUser
}