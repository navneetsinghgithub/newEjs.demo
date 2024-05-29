const imageupload = (file, folder = "users") => {
    let file_name_string = file.name;
    var file_name_array = file_name_string.split(".");
    var file_ext = file_name_array[1];
    var letters = "ABCDE1234567890FGHJK1234567890MNPQRSTUXY";
    var result = "";
    while (result.length < 28) {
        var rand_int = Math.floor(Math.random() * 19 + 1);
        var rand_chr = letters[rand_int];
        if (result.substr(-1, 1) != rand_chr) result += rand_chr;
    }
    var resultExt = `${result}.${file_ext}`;
    file.mv(`public/Images/${folder}/${result}.${file_ext}`, function (err) {
        if (err) {
            throw err;
        }
    });
    return resultExt;
}

const checkValidation = async (v) => {
    try {
        const matched = await v.check();
        if (!matched) {
            let errorResponse = Object.values(v.errors || {})
                .map(error => error.message)
            return errorResponse.join(",")
        }
    } catch (error) {
        console.log(error, "validator error")
        return "validator error"
    }

}

failed=(res, message = "") => {
    message =
      typeof message === "object"
        ? message.message
          ? message.message
          : ""
        : message;
    return res.status(400).json({
      success: false,
      code: 400,
      message: message,
      body: {},
    });
  },
  success= (res, message = "", body = {}) => {
    return res.status(200).json({
      success: true,
      code: 200,
      message: message,
      body: body,
    });
  },

  error= (res, err, req) => {
    let code = typeof err === "object" ? (err.code ? err.code : 403) : 403;
    let message =
      typeof err === "object" ? (err.message ? err.message : "") : err;
    if (req) {
      req.flash("flashMessage", {
        color: "error",
        message,
      });
      const originalUrl = req.originalUrl.split("/")[1];
      return res.redirect(`/${originalUrl}`);
    }
    return res.status(code).json({
      success: false,
      message: message,
      code: code,
      body: {},
    });
  }

 module.exports ={imageupload , checkValidation ,}