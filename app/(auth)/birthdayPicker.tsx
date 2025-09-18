import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = {
  value: Date | null;
  onChange: (date: Date | null) => void;
};

export default function BirthdatePickerModal({ value, onChange }: Props) {
  const [visible, setVisible] = useState(false);
  const today = new Date();
  const [tempDate, setTempDate] = useState(value || today);

  const showDate = value
    ? value.toLocaleDateString()
    : 'Select your birthdate';

  const handleConfirm = () => {
    onChange(tempDate);
    setVisible(false);
  };

  return (
    <>
      {/* Trigger field */}
      <TouchableOpacity style={styles.field} onPress={() => setVisible(true)}>
        <Text style={{ color: value ? 'black' : '#888' }}>{showDate}</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={{textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: '#1f5474ff', marginTop: 6, marginBottom: 5}}>Confirm your birthdate by tapping</Text>
            <Text style={{textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: '#1f744aff', marginTop: 6, marginBottom: 5}}>"Confirm"</Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={tempDate.toISOString().split('T')[0]}
                max={today.toISOString().split('T')[0]}
                onChange={(e) => setTempDate(new Date(e.target.value))}
                style={{ padding: 10, fontSize: 16 }}
              />
            ) : (
              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={today}
                onChange={(event, selectedDate) => {
                  if (selectedDate) setTempDate(selectedDate);
                }}
                themeVariant="light" // makes sure dark mode doesn't dim text
                textColor="black"
              />
            )}

            <View style={styles.buttons}>
              <TouchableOpacity onPress={() => setVisible(false)} style={styles.cancel}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirm} style={styles.confirm}>
                <Text style={styles.btnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  cancel: {
    flex: 1,
    padding: 12,
    backgroundColor: 'gray',
    marginRight: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirm: {
    flex: 1,
    padding: 12,
    backgroundColor: 'rgba(16, 82, 51, 1)',
    marginLeft: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
