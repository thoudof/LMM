import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Client } from '../types';

interface ClientFormProps {
  initialValues?: Client;
  onSubmit: (client: Client) => void;
  onCancel: () => void;
}

const defaultClient: Client = {
  name: '',
  inn: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
};

const ClientForm: React.FC<ClientFormProps> = ({ 
  initialValues = defaultClient, 
  onSubmit, 
  onCancel 
}) => {
  const [client, setClient] = useState<Client>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof Client, string>>>({});
  
  const handleChange = (field: keyof Client, value: string) => {
    setClient(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Client, string>> = {};
    
    if (!client.name.trim()) {
      newErrors.name = 'Название организации обязательно';
    }
    
    if (!client.inn.trim()) {
      newErrors.inn = 'ИНН обязателен';
    } else if (!/^\d{10}$|^\d{12}$/.test(client.inn)) {
      newErrors.inn = 'ИНН должен содержать 10 или 12 цифр';
    }
    
    if (!client.contactPerson.trim()) {
      newErrors.contactPerson = 'Контактное лицо обязательно';
    }
    
    if (!client.phone.trim()) {
      newErrors.phone = 'Телефон обязателен';
    }
    
    if (client.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) {
      newErrors.email = 'Неверный формат email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (validate()) {
      onSubmit(client);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <TextInput
        label="Название организации *"
        value={client.name}
        onChangeText={(value) => handleChange('name', value)}
        style={styles.input}
        error={!!errors.name}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      
      <TextInput
        label="ИНН *"
        value={client.inn}
        onChangeText={(value) => handleChange('inn', value)}
        style={styles.input}
        keyboardType="numeric"
        error={!!errors.inn}
      />
      {errors.inn && <Text style={styles.errorText}>{errors.inn}</Text>}
      
      <TextInput
        label="Контактное лицо *"
        value={client.contactPerson}
        onChangeText={(value) => handleChange('contactPerson', value)}
        style={styles.input}
        error={!!errors.contactPerson}
      />
      {errors.contactPerson && <Text style={styles.errorText}>{errors.contactPerson}</Text>}
      
      <TextInput
        label="Телефон *"
        value={client.phone}
        onChangeText={(value) => handleChange('phone', value)}
        style={styles.input}
        keyboardType="phone-pad"
        error={!!errors.phone}
      />
      {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      
      <TextInput
        label="Email"
        value={client.email}
        onChangeText={(value) => handleChange('email', value)}
        style={styles.input}
        keyboardType="email-address"
        error={!!errors.email}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      
      <TextInput
        label="Адрес"
        value={client.address}
        onChangeText={(value) => handleChange('address', value)}
        style={styles.input}
      />
      
      <TextInput
        label="Примечания"
        value={client.notes}
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
    marginBottom: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
    marginTop: -4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 32,
  },
  button: {
    width: '48%',
  },
});

export default ClientForm;