import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import { Trip, TripStatus } from '../types';
import { useDatabase } from '../context/DatabaseContext';

// Создаем функцию для получения безопасного начального состояния
const getSafeInitialState = (initialValues?: Trip | null): Trip => {
  // Базовые значения по умолчанию
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

  // Если initialValues не предоставлены или null, возвращаем defaultTrip
  if (!initialValues) {
    return defaultTrip;
  }

  // Иначе объединяем defaultTrip с initialValues, обеспечивая безопасные значения
  return {
    ...defaultTrip,
    // Сохраняем id, если он есть
    ...(initialValues.id ? { id: initialValues.id } : {}),
    // Безопасно копируем строковые поля
    date: initialValues.date || defaultTrip.date,
    clientId: initialValues.clientId || defaultTrip.clientId,
    startLocation: initialValues.startLocation || defaultTrip.startLocation,
    endLocation: initialValues.endLocation || defaultTrip.endLocation,
    cargo: initialValues.cargo || defaultTrip.cargo,
    driver: initialValues.driver || defaultTrip.driver,
    vehicle: initialValues.vehicle || defaultTrip.vehicle,
    status: initialValues.status || defaultTrip.status,
    notes: initialValues.notes || defaultTrip.notes,
    // Безопасно копируем числовые поля
    income: typeof initialValues.income === 'number' ? initialValues.income : defaultTrip.income,
    expenses: typeof initialValues.expenses === 'number' ? initialValues.expenses : defaultTrip.expenses,
  };
};

const statusOptions = [
  { label: 'Запланирован', value: 'planned' },
  { label: 'В пути', value: 'in-progress' },
  { label: 'Завершен', value: 'completed' },
  { label: 'Отменен', value: 'cancelled' },
];

const TripForm: React.FC<TripFormProps> = ({ 
  initialValues, 
  onSubmit, 
  onCancel 
}) => {
  const { clients } = useDatabase();
  
  // Используем функцию getSafeInitialState для безопасной инициализации
  const [trip, setTrip] = useState<Trip>(getSafeInitialState(initialValues));
  const [errors, setErrors] = useState<Partial<Record<keyof Trip, string>>>({});
  
  // Dropdown state
  const [openClientDropdown, setOpenClientDropdown] = useState(false);
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);
  
  // Get screen dimensions for responsive design
  const windowWidth = Dimensions.get('window').width;
  const isSmallScreen = windowWidth < 375;
  
  // Обновляем состояние, если initialValues изменились
  useEffect(() => {
    setTrip(getSafeInitialState(initialValues));
  }, [initialValues]);
  
  const handleChange = (field: keyof Trip, value: any) => {
    setTrip(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Trip, string>> = {};
    
    // Безопасно проверяем все поля
    if (!trip.date) {
      newErrors.date = 'Дата обязательна';
    }
    
    if (!trip.clientId) {
      newErrors.clientId = 'Клиент обязателен';
    }
    
    // Используем безопасные проверки для строковых полей
    if (!trip.startLocation || trip.startLocation.trim() === '') {
      newErrors.startLocation = 'Пункт отправления обязателен';
    }
    
    if (!trip.endLocation || trip.endLocation.trim() === '') {
      newErrors.endLocation = 'Пункт назначения обязателен';
    }
    
    if (!trip.cargo || trip.cargo.trim() === '') {
      newErrors.cargo = 'Описание груза обязательно';
    }
    
    if (!trip.driver || trip.driver.trim() === '') {
      newErrors.driver = 'Водитель обязателен';
    }
    
    if (!trip.vehicle || trip.vehicle.trim() === '') {
      newErrors.vehicle = 'Транспортное средство обязательно';
    }
    
    // Проверяем числовые поля
    if (typeof trip.income !== 'number' || trip.income < 0) {
      newErrors.income = 'Доход не может быть отрицательным';
    }
    
    if (typeof trip.expenses !== 'number' || trip.expenses < 0) {
      newErrors.expenses = 'Расходы не могут быть отрицательными';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    // Перед валидацией убедимся, что все поля имеют правильные типы
    const safeTrip = getSafeInitialState(trip);
    setTrip(safeTrip);
    
    if (validate()) {
      onSubmit(safeTrip);
    }
  };
  
  // Prepare client options for dropdown
  const clientOptions = clients.map(client => ({
    label: client.name,
    value: client.id || '',
  }));
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <TextInput
          label="Дата *"
          value={trip.date}
          onChangeText={(value) => handleChange('date', value)}
          style={styles.input}
          error={!!errors.date}
          placeholder="ГГГГ-ММ-ДД"
          mode="outlined"
          outlineColor="#ccc"
          activeOutlineColor="#2196F3"
        />
        {errors.date && <HelperText type="error">{errors.date}</HelperText>}
        
        <Text style={styles.dropdownLabel}>Клиент *</Text>
        <View style={[styles.dropdownContainer, { zIndex: 3000 }]}>
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
            maxHeight={200}
          />
        </View>
        {errors.clientId && <HelperText type="error">{errors.clientId}</HelperText>}
        
        <View style={styles.rowContainer}>
          <View style={styles.halfInput}>
            <TextInput
              label="Пункт отправления *"
              value={trip.startLocation}
              onChangeText={(value) => handleChange('startLocation', value)}
              style={styles.input}
              error={!!errors.startLocation}
              mode="outlined"
              outlineColor="#ccc"
              activeOutlineColor="#2196F3"
            />
            {errors.startLocation && <HelperText type="error">{errors.startLocation}</HelperText>}
          </View>
          
          <View style={styles.halfInput}>
            <TextInput
              label="Пункт назначения *"
              value={trip.endLocation}
              onChangeText={(value) => handleChange('endLocation', value)}
              style={styles.input}
              error={!!errors.endLocation}
              mode="outlined"
              outlineColor="#ccc"
              activeOutlineColor="#2196F3"
            />
            {errors.endLocation && <HelperText type="error">{errors.endLocation}</HelperText>}
          </View>
        </View>
        
        <TextInput
          label="Груз *"
          value={trip.cargo}
          onChangeText={(value) => handleChange('cargo', value)}
          style={styles.input}
          error={!!errors.cargo}
          mode="outlined"
          outlineColor="#ccc"
          activeOutlineColor="#2196F3"
        />
        {errors.cargo && <HelperText type="error">{errors.cargo}</HelperText>}
        
        <View style={styles.rowContainer}>
          <View style={styles.halfInput}>
            <TextInput
              label="Водитель *"
              value={trip.driver}
              onChangeText={(value) => handleChange('driver', value)}
              style={styles.input}
              error={!!errors.driver}
              mode="outlined"
              outlineColor="#ccc"
              activeOutlineColor="#2196F3"
            />
            {errors.driver && <HelperText type="error">{errors.driver}</HelperText>}
          </View>
          
          <View style={styles.halfInput}>
            <TextInput
              label="Транспорт *"
              value={trip.vehicle}
              onChangeText={(value) => handleChange('vehicle', value)}
              style={styles.input}
              error={!!errors.vehicle}
              mode="outlined"
              outlineColor="#ccc"
              activeOutlineColor="#2196F3"
            />
            {errors.vehicle && <HelperText type="error">{errors.vehicle}</HelperText>}
          </View>
        </View>
        
        <Text style={styles.dropdownLabel}>Статус *</Text>
        <View style={[styles.dropdownContainer, { zIndex: 2000 }]}>
          <DropDownPicker
            open={openStatusDropdown}
            value={trip.status}
            items={statusOptions}
            setOpen={setOpenStatusDropdown}
            setValue={(callback) => {
              if (typeof callback === 'function') {
                const newValue = callback(trip.status);
                handleChange('status', newValue);
              } else {
                handleChange('status', callback);
              }
            }}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownList}
            placeholder="Выберите статус"
            listMode="SCROLLVIEW"
            maxHeight={200}
          />
        </View>
        
        <View style={styles.rowContainer}>
          <View style={styles.halfInput}>
            <TextInput
              label="Доход (₽) *"
              value={trip.income.toString()}
              onChangeText={(value) => handleChange('income', parseFloat(value) || 0)}
              style={styles.input}
              keyboardType="numeric"
              error={!!errors.income}
              mode="outlined"
              outlineColor="#ccc"
              activeOutlineColor="#2196F3"
            />
            {errors.income && <HelperText type="error">{errors.income}</HelperText>}
          </View>
          
          <View style={styles.halfInput}>
            <TextInput
              label="Расходы (₽) *"
              value={trip.expenses.toString()}
              onChangeText={(value) => handleChange('expenses', parseFloat(value) || 0)}
              style={styles.input}
              keyboardType="numeric"
              error={!!errors.expenses}
              mode="outlined"
              outlineColor="#ccc"
              activeOutlineColor="#2196F3"
            />
            {errors.expenses && <HelperText type="error">{errors.expenses}</HelperText>}
          </View>
        </View>
        
        <TextInput
          label="Примечания"
          value={trip.notes}
          onChangeText={(value) => handleChange('notes', value)}
          style={styles.input}
          multiline
          numberOfLines={3}
          mode="outlined"
          outlineColor="#ccc"
          activeOutlineColor="#2196F3"
        />
        
        <View style={styles.buttonContainer}>
          <Button 
            mode="outlined" 
            onPress={onCancel} 
            style={styles.button}
            buttonColor="#fff"
            textColor="#2196F3"
          >
            Отмена
          </Button>
          <Button 
            mode="contained" 
            onPress={handleSubmit} 
            style={styles.button}
            buttonColor="#2196F3"
          >
            Сохранить
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  dropdownLabel: {
    fontSize: 12,
    marginBottom: 4,
    color: '#666',
    paddingLeft: 4,
  },
  dropdownContainer: {
    marginBottom: 16,
    zIndex: 1000,
  },
  dropdown: {
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  dropdownList: {
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  halfInput: {
    width: '48%',
    ...Platform.select({
      web: {
        minWidth: 150,
      },
      default: {}
    }),
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
    borderRadius: 8,
    paddingVertical: 6,
  },
});

export default TripForm;
