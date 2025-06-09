import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
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
  
  // Get screen dimensions for responsive design
  const windowWidth = Dimensions.get('window').width;
  const isSmallScreen = windowWidth < 375;
  
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
      <View style={styles.formContainer}>
        <TextInput
          label="Название организации *"
          value={client.name}
          onChangeText={(value) => handleChange('name', value)}
          style={styles.input}
          error={!!errors.name}
          mode="outlined"
          outlineColor="#ccc"
          activeOutlineColor="#2196F3"
        />
        {errors.name && <HelperText type="error">{errors.name}</HelperText>}
        
        <TextInput
          label="ИНН *"
          value={client.inn}
          onChangeText={(value) => handleChange('inn', value)}
          style={styles.input}
          keyboardType="numeric"
          error={!!errors.inn}
          mode="outlined"
          outlineColor="#ccc"
          activeOutlineColor="#2196F3"
        />
        {errors.inn && <HelperText type="error">{errors.inn}</HelperText>}
        
        <View style={styles.rowContainer}>
          <View style={styles.halfInput}>
            <TextInput
              label="Контактное лицо *"
              value={client.contactPerson}
              onChangeText={(value) => handleChange('contactPerson', value)}
              style={styles.input}
              error={!!errors.contactPerson}
              mode="outlined"
              outlineColor="#ccc"
              activeOutlineColor="#2196F3"
            />
            {errors.contactPerson && <HelperText type="error">{errors.contactPerson}</HelperText>}
          </View>
          
          <View style={styles.halfInput}>
            <TextInput
              label="Телефон *"
              value={client.phone}
              onChangeText={(value) => handleChange('phone', value)}
              style={styles.input}
              keyboardType="phone-pad"
              error={!!errors.phone}
              mode="outlined"
              outlineColor="#ccc"
              activeOutlineColor="#2196F3"
            />
            {errors.phone && <HelperText type="error">{errors.phone}</HelperText>}
          </View>
        </View>
        
        <TextInput
          label="Email"
          value={client.email}
          onChangeText={(value) => handleChange('email', value)}
          style={styles.input}
          keyboardType="email-address"
          error={!!errors.email}
          mode="outlined"
          outlineColor="#ccc"
          activeOutlineColor="#2196F3"
        />
        {errors.email && <HelperText type="error">{errors.email}</HelperText>}
        
        <TextInput
          label="Адрес"
          value={client.address}
          onChangeText={(value) => handleChange('address', value)}
          style={styles.input}
          mode="outlined"
          outlineColor="#ccc"
          activeOutlineColor="#2196F3"
        />
        
        <TextInput
          label="Примечания"
          value={client.notes}
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
  errorText: {
    color: 'red',
    marginBottom: 8,
    marginTop: -4,
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 32,
  },
  button: {
    width: '48%',
    borderRadius: 8,
    paddingVertical: 6,
  },
});

export default ClientForm;
