import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import { Trip, Client, TripStatus } from '../types';
import { useDatabase } from '../context/DatabaseContext';

interface TripFormProps {
  initialValues?: Trip;
  onSubmit: (trip: Trip) => void;
  onCancel: () => void;
}

const defaultTrip: Trip = {
  date: new Date().toISOString().split('T')[0],
  clientId: '',
  startLocation: '',
  endLocation: '',
  cargo: '',
  driver: '',
  vehicle: '',
  status: 'planned',
  income: 0,
  expenses: 0,
  notes: '',
};

const statusOptions = [
  { label: 'Запланирован', value: 'planned' },
  { label: 'В пути', value: 'in-progress' },
  { label: 'Завершен', value: 'completed' },
  { label: 'Отменен', value: 'cancelled' },
];

const TripForm: React.FC<TripFormProps> = ({ 
  initialValues = defaultTrip, 
  onSubmit, 
  onCancel 
}) => {
  const { clients } = useDatabase();
  const [trip, setTrip] = useState<Trip>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof Trip, string>>>({});
  
  // Dropdown state
  const [openClientDropdown, setOpenClientDropdown] = useState(false);
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);
  
  const handleChange = (field: keyof Trip, value: any) => {
    setTrip(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Trip, string>> = {};
    
    if (!trip.date) {
      newErrors.date = 'Дата обязательна';
    }
    
    if (!trip.clientId) {
      newErrors.clientId = 'Клиент обязателен';
    }
    
    if (!trip.startLocation.trim()) {
      newErrors.startLocation = 'Пункт отправления обязателен';
    }
    
    if (!trip.endLocation.trim()) {
      newErrors.endLocation = 'Пункт назначения обязателен';
    }
    
    if (!trip.cargo.trim()) {
      newErrors.cargo = 'Описание груза обязательно';
    }
    
    if (!trip.driver.trim()) {
      newErrors.driver = 'Водитель обязателен';
    }
    
    if (!trip.vehicle.trim()) {
      newErrors.vehicle = 'Транспортное средство обязательно';
    }
    
    if (trip.income < 0) {
      newErrors.income = 'Доход не может быть отрицательным';
    }
    
    if (trip.expenses < 0) {
      newErrors.expenses = 'Расходы не могут быть отрицательными';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (validate()) {
      onSubmit(trip);
    }
  };
  
  // Prepare client options for dropdown
  const clientOptions = clients.map(client => ({
    label: client.name,
    value: client.id || '',
  }));
  
  return (
    <ScrollView style={styles.container}>
      <TextInput
        label="Дата *"
        value={trip.date}
        onChangeText={(value) => handleChange('date', value)}
        style={styles.input}
        error={!!errors.date}
        placeholder="ГГГГ-ММ-ДД"
      />
      {errors.date && <HelperText type="error">{errors.date}</HelperText>}
      
      <Text style={styles.dropdownLabel}>Клиент *</Text>
      <View style={styles.dropdownContainer}>
        <DropDownPicker
          open={openClientDropdown}
          value={trip.clientId}
          items={clientOptions}
          setOpen={setOpenClientDropdown}
          setValue={(callback) => {
            if (typeof callback === 'function') {
              const newValue = callback(trip.clientId);
              handleChange('clientId', newValue);
            } else {
              handleChange('clientId', callback);
            }
          }}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownList}
          placeholder="Выберите клиента"
          listMode="SCROLLVIEW"
        />
      </View>
      {errors.clientId && <HelperText type="error">{errors.clientId}</HelperText>}
      
      <TextInput
        label="Пункт отправления *"
        value={trip.startLocation}
        onChangeText={(value) => handleChange('startLocation', value)}
        style={styles.input}
        error={!!errors.startLocation}
      />
      {errors.startLocation && <HelperText type="error">{errors.startLocation}</HelperText>}
      
      <TextInput
        label="Пункт назначения *"
        value={trip.endLocation}
        onChangeText={(value) => handleChange('endLocation', value)}
        style={styles.input}
        error={!!errors.endLocation}
      />
      {errors.endLocation && <HelperText type="error">{errors.endLocation}</HelperText>}
      
      <TextInput
        label="Груз *"
        value={trip.cargo}
        onChangeText={(value) => handleChange('cargo', value)}
        style={styles.input}
        error={!!errors.cargo}
      />
      {errors.cargo && <HelperText type="error">{errors.cargo}</HelperText>}
      
      <TextInput
        label="Водитель *"
        value={trip.driver}
        onChangeText={(value) => handleChange('driver', value)}
        style={styles.input}
        error={!!errors.driver}
      />
      {errors.driver && <HelperText type="error">{errors.driver}</HelperText>}
      
      <TextInput
        label="Транспортное средство *"
        value={trip.vehicle}
        onChangeText={(value) => handleChange('vehicle', value)}
        style={styles.input}
        error={!!errors.vehicle}
      />
      {errors.vehicle && <HelperText type="error">{errors.vehicle}</HelperText>}
      
      <Text style={styles.dropdownLabel}>Статус *</Text>
      <View style={styles.dropdownContainer}>
        <DropDownPicker
          open={openStatusDropdown}
          value={trip.status}
          items={statusOptions}
          setOpen={setOpenStatusDropdown}
          setValue={(callback) => {
            if (typeof callback === 'function') {
              const newValue = callback(trip.status as string);
              handleChange('status', newValue);
            } else {
              handleChange('status', callback);
            }
          }}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownList}
          placeholder="Выберите статус"
          listMode="SCROLLVIEW"
        />
      </View>
      
      <TextInput
        label="Доход (₽) *"
        value={trip.income.toString()}
        onChangeText={(value) => handleChange('income', parseFloat(value) || 0)}
        style={styles.input}
        keyboardType="numeric"
        error={!!errors.income}
      />
      {errors.income && <HelperText type="error">{errors.income}</HelperText>}
      
      <TextInput
        label="Расходы (₽) *"
        value={trip.expenses.toString()}
        onChangeText={(value) => handleChange('expenses', parseFloat(value) || 0)}
        style={styles.input}
        keyboardType="numeric"
        error={!!errors.expenses}
      />
      {errors.expenses && <HelperText type="error">{errors.expenses}</HelperText>}
      
      <TextInput
        label="Примечания"
        value={trip.notes}
        onChangeText={(value) => handleChange('notes', value)}
        style={styles.input}
        multiline
        numberOfLines={3}
      />
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="outlined" 
          onPress={onCancel} 
          style={styles.button}
        >
          Отмена
        </Button>
        <Button 
          mode="contained" 
          onPress={handleSubmit} 
          style={styles.button}
        >
          Сохранить
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 12,
    marginBottom: 4,
    color: '#666',
  },
  dropdownContainer: {
    marginBottom: 16,
    zIndex: 1000,
  },
  dropdown: {
    borderColor: '#ccc',
    borderRadius: 4,
  },
  dropdownList: {
    borderColor: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 32,
    zIndex: -1,
  },
  button: {
    width: '48%',
  },
});

export default TripForm;