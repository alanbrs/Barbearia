
import { ServiceType, Service } from './types';

export const SERVICES: Service[] = [
  {
    id: 's1',
    name: ServiceType.HAIRCUT,
    price: 50,
    duration: 40,
    description: 'Corte moderno, clássico ou degradê com acabamento premium.'
  },
  {
    id: 's2',
    name: ServiceType.BEARD,
    price: 35,
    duration: 30,
    description: 'Design de barba com toalha quente e produtos de alta qualidade.'
  },
  {
    id: 's3',
    name: ServiceType.COMBO,
    price: 75,
    duration: 70,
    description: 'O pacote clássico: Cabelo e Barba para renovar seu visual.'
  },
  {
    id: 's4',
    name: ServiceType.VIP,
    price: 110,
    duration: 100,
    description: 'Experiência completa com massagem capilar e hidratação.'
  }
];

export const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

export const DAYS_TO_SHOW = 7;
