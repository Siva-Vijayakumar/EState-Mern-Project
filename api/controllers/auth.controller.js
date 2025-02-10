import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // console.log(hashedPassword);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    console.log(newUser);
    res.status(200).json({ message: "User Sucessfully Registered!" });
  } catch (error) {
    console.log("Error on the authController", error);
    res.status(500).json({ message: "Failed to Create User!" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const age = 1000 * 60 * 60 * 24 * 7;
    const token = jwt.sign(
      {
        id: user.id,
        isAdmin: false,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: age }
    );

    const {password: userPassword, ...userInfo} = user;

    // res.setHeader("set-Cookie", "test=" + "myValue");
    return res
      .cookie("token", token, {
        httpOnly: true,
        maxAge: age,
        // secure: true
      })
      .status(200)
      .json(userInfo);
  } catch (error) {
    console.log("Error in the authController", error);
    return res.status(500).json({ message: "Failed to login!" });
  }
};

export const logout = (req, res) => {
    res.clearCookie("token").status(200).json({message: "Logged Out Sucessfully!"});
};
