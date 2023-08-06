import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();
type Body = {
  email?: string;
  phoneNumber?: number;
};

export const identify = async (req: Request, res: Response) => {
  try {
    console.log("body", req.body);

    const { email, phoneNumber } = req.body as Body;
    console.log("email", email);

    if (email !== undefined && phoneNumber !== undefined) {
      const getContact = await prisma.contact.findFirst({
        where: {
          OR:[
            {
              email
            },
            {
              phoneNumber
            }
          ]
        }
      })
      const create = await prisma.contact.create({
        data: {
          email: email,
          phoneNumber: phoneNumber,
          linkPrecedence: "primary",
        },
      });
      return res.status(200).json({ create });
    }
  } catch (error) {
    console.log(error);

    return res.status(400).json(error);
  }
};
