import { Request, Response } from 'express';
import { FormData } from '../models/formData.model';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function isValidEcuadorianCI(ci: string): boolean {
  if (ci.length !== 10 || isNaN(Number(ci))) return false;

  const provinceCode = parseInt(ci.substring(0, 2), 10);
  if (provinceCode < 1 || provinceCode > 24) return false;

  const thirdDigit = parseInt(ci[2], 10);
  if (thirdDigit > 5) return false;

  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let total = 0;

  for (let i = 0; i < 9; i++) {
    let value = parseInt(ci[i], 10) * coefficients[i];
    if (value >= 10) value -= 9;
    total += value;
  }

  const verifier = parseInt(ci[9], 10);
  const calculatedVerifier = (10 - (total % 10)) % 10;

  return verifier === calculatedVerifier;
}

function sanitizeInput(input: string): string {
  return input.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '');
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const submitFormData = async (req: Request, res: Response): Promise<void> => {
  try {
    const formData = req.body as FormData;

    // Validar cédula ecuatoriana
    if (formData.ciOrPassport.length === 10 && !isValidEcuadorianCI(formData.ciOrPassport)) {
      res.status(400).json({ message: 'Número de cédula ecuatoriana inválido' });
      return;
    }

    // Validar formato de email
    if (!isValidEmail(formData.email)) {
      res.status(400).json({ message: 'Formato de correo electrónico inválido' });
      return;
    }

    // Sanitizar campos de texto
    formData.fullName = sanitizeInput(formData.fullName);
    formData.lastName = sanitizeInput(formData.lastName);
    formData.phoneNumber = sanitizeInput(formData.phoneNumber);
    formData.country = sanitizeInput(formData.country);
    formData.cityOrProvince = sanitizeInput(formData.cityOrProvince);
    formData.profession = sanitizeInput(formData.profession);
    formData.institution = sanitizeInput(formData.institution);

    const savedData = await prisma.formData.create({
      data: formData,
    });

    res.status(200).json({ message: 'Datos recibidos correctamente', data: savedData });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ message: 'Ocurrió un error al procesar la solicitud. Por favor, inténtelo de nuevo más tarde.' });
  }
};

export const getAllFormData = async (req: Request, res: Response): Promise<void> => {
  try {
    const allData = await prisma.formData.findMany();
    res.status(200).json({ message: 'Datos obtenidos correctamente', data: allData });
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    res.status(500).json({ message: 'Error al obtener los datos' });
  }
};

export const getFormDataById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const data = await prisma.formData.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!data) {
      res.status(404).json({ message: 'Registro no encontrado' });
      return;
    }

    res.status(200).json({ message: 'Datos obtenidos correctamente', data });
  } catch (error) {
    console.error('Error al obtener el dato:', error);
    res.status(500).json({ message: 'Error al obtener el dato' });
  }
};

export const updateFormDataById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedData = req.body as Partial<FormData>;

    // Validar cédula ecuatoriana si se proporciona
    if (updatedData.ciOrPassport && updatedData.ciOrPassport.length === 10 && !isValidEcuadorianCI(updatedData.ciOrPassport)) {
      res.status(400).json({ message: 'Número de cédula ecuatoriana inválido' });
      return;
    }

    // Validar formato de email si se proporciona
    if (updatedData.email && !isValidEmail(updatedData.email)) {
      res.status(400).json({ message: 'Formato de correo electrónico inválido' });
      return;
    }

    // Sanitizar campos de texto
    if (updatedData.fullName) updatedData.fullName = sanitizeInput(updatedData.fullName);
    if (updatedData.lastName) updatedData.lastName = sanitizeInput(updatedData.lastName);
    if (updatedData.phoneNumber) updatedData.phoneNumber = sanitizeInput(updatedData.phoneNumber);
    if (updatedData.country) updatedData.country = sanitizeInput(updatedData.country);
    if (updatedData.cityOrProvince) updatedData.cityOrProvince = sanitizeInput(updatedData.cityOrProvince);
    if (updatedData.profession) updatedData.profession = sanitizeInput(updatedData.profession);
    if (updatedData.institution) updatedData.institution = sanitizeInput(updatedData.institution);

    const updatedRecord = await prisma.formData.update({
      where: { id: parseInt(id, 10) },
      data: updatedData,
    });

    res.status(200).json({ message: 'Datos actualizados correctamente', data: updatedRecord });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ message: 'Ocurrió un error al procesar la solicitud. Por favor, inténtelo de nuevo más tarde.' });
  }
};

export const deleteFormDataById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const existingData = await prisma.formData.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingData) {
      res.status(404).json({ message: 'Registro no encontrado' });
      return;
    }

    await prisma.formData.delete({
      where: { id: parseInt(id, 10) },
    });

    res.status(200).json({ message: 'Registro eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el dato:', error);
    res.status(500).json({ message: 'Error al eliminar el dato' });
  }
};
