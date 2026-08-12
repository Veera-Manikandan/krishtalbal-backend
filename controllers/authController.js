import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";

function sign(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role, baseId: user.baseId?.toString() || null },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
}

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    await AuditLog.create({
      userId: user._id,
      action: "LOGIN",
      details: `User ${user.username} logged in`
    });

    res.json({
      token: sign(user),
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        baseId: user.baseId
      }
    });
  } catch (e) { next(e); }
}

export async function me(req, res) {
  res.json({ user: req.user });
}