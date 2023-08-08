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
      console.log("data -->", {phoneNumber, email});
      const getContact = await prisma.contact.findFirst({
        where: {
          OR: [
            {
              emails: { has: email !== null ? email : "" },
            },
            {
              phoneNumbers: { has: phoneNumber === null ? "" : phoneNumber },
            },
          ],
          linkPrecedence: "primary",
        },
      });
      console.log("getContact->", getContact);
      
      if (getContact) {
        if (
          getContact.emails.includes(email) ||
          getContact.phoneNumbers.includes(phoneNumber)
        ) {
          if (email !== null && phoneNumber !== null) {
            createData = {
              emails: [email],
              phoneNumbers: [phoneNumber],
              linkedId: getContact.id,
              linkPrecedence: "secondary",
            };

            await prisma.contact.create({ data: createData });
          }

          //data formating
          const allContacts = await prisma.contact.findMany({
            where: {
              linkedId: getContact.id,
            },
          });
          const secondaryContactIds: Array<number> = allContacts.map(
            (e) => e.id
          );
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
          return res.status(201).json({
            contact: {
              primaryContactId: getContact.id,
              emails,
              phoneNumbers,
              secondaryContactIds,
            },
          });
        }
      } else {
        createData = {
          emails: [email],
          phoneNumbers: [phoneNumber],
          linkPrecedence: "primary",
        };
        const create = await prisma.contact.create({
          data: createData,
        });
        return res.status(201).json({ create });
      }
    }
  } catch (error) {
    console.log(error);

    return res.status(400).json(error);
  }
};
