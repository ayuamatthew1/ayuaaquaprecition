// import { hashPassword, verifyPassword } from "@/src/lib/password";
// import { prisma } from "@/src/utils/db.server";
// import { RegisterInput } from "@/src/validations/auth.validation";

// export async function registerService(data: RegisterInput) {
//   const existingUser = await prisma.user.findFirst({
//     where: {
//       OR: [
//         {
//           email: data.email,
//         },
//         {
//           username: data.username,
//         },
//       ],
//     },
//   });

//   if (existingUser) {
//     throw new Error("Email or username already exists.");
//   }

//   if (existingUser && existingUser.phone == data.phone) {
//     throw new Error("Phone number already exists.");
//   }

//   const passwordHash = await hashPassword(data.password);

//   const user = await prisma.user.create({
//     data: {
//       firstName: data.firstName,
//       lastName: data.lastName,
//       username: data.username,
//       email: data.email,
//       phone: data.phone!,
//       passwordHash,
//     },
//   });

//   return user;
// }

// export async function loginService(identifier: string, password: string) {
//   const user = await prisma.user.findFirst({
//     where: {
//       OR: [
//         {
//           email: identifier,
//         },
//       ]
//     },
//   });

//   if (!user) {
//     throw new Error("Invalid credentials.");
//   }

//   const isMatch = await verifyPassword(password, user.passwordHash);

//   if (!isMatch) {
//     throw new Error("Invalid credentials.");
//   }

//   return user;
// }