import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  type DocumentData
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface Concept extends DocumentData {
  id: string;
  name: string;
  prompt: string;
  imageUrl: string;
  color: string;
  style: string;
  specs: {
    topSpeed: string;
    acceleration: string;
    power: string;
  };
  ownerId: string;
  createdAt: any;
}

export function useConcepts() {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'concepts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Concept[];
      setConcepts(docs);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Listen Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveConcept = async (concept: Omit<Concept, 'id' | 'createdAt' | 'ownerId'>) => {
    if (!auth.currentUser) throw new Error("Must be signed in to save.");
    
    await addDoc(collection(db, 'concepts'), {
      ...concept,
      ownerId: auth.currentUser.uid,
      createdAt: serverTimestamp()
    });
  };

  const deleteConcept = async (id: string) => {
    await deleteDoc(doc(db, 'concepts', id));
  };

  return { concepts, loading, saveConcept, deleteConcept };
}
