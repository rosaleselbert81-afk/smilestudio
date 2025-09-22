import { useState, useEffect } from 'react';
import type { ChatRoom } from '../lib/types';
import { supabase } from '@/lib/supabase';

export const useChatRoom = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const createOrFindRoom = async (client1: string, client2: string) => {
    try {
      // First, try to find existing room
      const { data: existingRoom } = await supabase
        .from('chat_room')
        .select(`*,
          clinic_profiles (
            clinic_name,
            clinic_photo_url
          ),
          profiles (
            first_name,
            last_name,
            avatar_url
          )`)
        .or(`and(client1.eq.${client1},client2.eq.${client2}),and(client1.eq.${client2},client2.eq.${client1})`)
        .single();

      if (existingRoom) {
        return existingRoom.id;
      }

      // Create new room if none exists
      const { data: newRoom, error } = await supabase
        .from('chat_room')
        .insert({
          client1,
          client2,
        })
        .select('id')
        .single();

      if (error) {
        console.log(`ERR Cannot create or find chat : ${error}`);
        return null;
      }
      return newRoom.id;
    } catch (error) {
      console.log(`ERR Cannot create or find chat : ${error}`);
      return null;
    }
  };

const getUserRooms = async (userId: string) => {
  try {
    setLoading(true);
    const { data, error } = await supabase
      .from('chat_room')
      .select(`
        *,
        clinic_profiles (
          clinic_name,
          clinic_photo_url
        ),
        profiles (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .or(`client1.eq.${userId},client2.eq.${userId}`)
      .order('last_message_at', { ascending: false });  // <-- order by last_message_at desc

    if (error) {
      console.error("Failed to fetch chat rooms:", error);
      setRooms([]);
    } else {
      setRooms(data || []);
    }
  } catch (err) {
    console.error("Unexpected error fetching rooms:", err);
    setRooms([]);
  } finally {
    setLoading(false);
  }
};


  return {
    rooms,
    loading,
    createOrFindRoom,
    getUserRooms,
  };
};
