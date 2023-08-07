import { Prisma, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();
type Body = {
  email?: string;
  phoneNumber?: string;
};

export const identify = async (req: Request, res: Response) => {
  try {
    console.log("body", req.body);

    const { email, phoneNumber } = req.body as Body;
    let createData: Prisma.ContactUncheckedCreateInput = {
      linkPrecedence:'primary'
    };

    if (email !== undefined && phoneNumber !== undefined) {
      console.log("email", email);
      const getContact = await prisma.contact.findFirst({
        where: {
          OR: [
            {
              emails: { has: email },
            },
            {
              phoneNumbers: { has: phoneNumber },
            },
          ],
        },
      });
      if (getContact) {
        createData = {
          emails: [...new Set([...(getContact.emails || []), email])],
          phoneNumbers: [
            ...new Set([...(getContact.phoneNumbers || []), phoneNumber]),
          ],
          linkedId: getContact.id,
          linkPrecedence: "secondary",
        };
      } else {
        createData = {
          emails: [email],
          phoneNumbers: [phoneNumber],
          linkPrecedence: "primary",
        };
      }

      const create = await prisma.contact.create({
        data: createData,
      });
      return res.status(200).json({ create });
    }
    return res.status(200).json({ hello: "joi" });
  } catch (error) {
    console.log(error);

    return res.status(400).json(error);
  }
};
