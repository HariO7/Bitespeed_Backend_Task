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
      linkPrecedence: "primary",
    };

    if (email !== undefined && phoneNumber !== undefined) {
      // add middleware for this check
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
        console.log("getContact->", getContact);

        if (
          getContact.emails.includes(email) &&
          getContact.phoneNumbers.includes(phoneNumber)
        ) {
          //data formating
          const allContacts = await prisma.contact.findMany({
            where: {
              linkedId: getContact.id,
            },
          });
          const secondaryContactIds: Array<number> = [];
          let emails = getContact.emails.concat(
            ...allContacts.map((c) => c.emails)
          );
          let phoneNumbers = getContact.phoneNumbers.concat(
            ...allContacts.map((c) => c.phoneNumbers)
          );
          emails = emails.filter(
            (item, index) => emails.indexOf(item) === index
          );
          phoneNumbers = phoneNumbers.filter(
            (item, index) => phoneNumbers.indexOf(item) === index
          );
          return res.json({
            contact: {
              primaryContactId: getContact.id,
              emails,
              phoneNumbers,
              secondaryContactIds,
            },
          });
        }
        // creation 
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
