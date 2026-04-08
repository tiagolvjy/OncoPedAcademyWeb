import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializa firebase-admin apenas no server
if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

export async function POST(request: NextRequest) {
    try {
        const { name, email, password, role, crm, phone, gender, birthDate, observations } = await request.json();

        // Cria no Firebase Auth
        const userRecord = await getAuth().createUser({ email, password, displayName: name });

        // Salva dados completos no Firestore
        await getFirestore().collection('users').doc(userRecord.uid).set({
            name,
            email,
            role: role ?? 'student',
            status: 'active',
            crm: crm ?? null,
            crmVerified: false,
            phone: phone ?? null,
            gender: gender ?? null,
            birthDate: birthDate ?? null,
            observations: observations ?? null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.code === 'auth/email-already-exists')
            return NextResponse.json({ success: false, error: 'Email já cadastrado.' });
        return NextResponse.json({ success: false, error: 'Erro ao criar usuário.' });
    }
}