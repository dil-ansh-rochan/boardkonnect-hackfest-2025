import { StyleSheet, ScrollView, View, Pressable, ActivityIndicator, Linking, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ListItemProps {
  title: string;
  subtitle: string;
  url: string;
  onPress?: () => void;
}

const toCamelCase = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr: string) => chr.toUpperCase());
};


function ListItem({ title, subtitle, url, onPress }: ListItemProps) {
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.listItem,
        pressed && styles.pressed
      ]} 
      onPress={onPress}
    >
      <View style={styles.listItemContent}>
        <View style={styles.textContainer}>
          <ThemedText style={styles.itemTitle}>{title}</ThemedText>
          <ThemedText style={styles.itemSubtitle}>{subtitle}</ThemedText>
        </View>
        <IconSymbol name="chevron.right" size={20} color="#666" />
      </View>
    </Pressable>
  );
}

interface GRCItem {
  title: string;
  subtitle: string;
  url: string;
}

export default function ListScreen() {
  const { title } = useLocalSearchParams<{ title: string }>();
  const { user } = useAuth();
  const [items, setItems] = useState<GRCItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGRCContent = async () => {
      if (!user?.id || !title) {
        console.log('Missing required data:', { userId: user?.id, title });
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const url = `https://board-konect-hackfest-2025.vercel.app/api/grc_content/${user.id}/${title.toLowerCase()}`;        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format: expected an array');
        }
        
        setItems(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchGRCContent();
  }, [user?.id, title]);

  const handleBack = () => {
    router.back();
  };

  const handleItemPress = async (url: string) => {
    if (url) {
      if (url.startsWith('/')) {
        router.push(url as any);
      } else if (url.toLowerCase().endsWith('.pdf')) {
        try {
          await Linking.openURL(url);
        } catch (error) {
          console.error('Error opening PDF:', error);
          // You might want to show an error message to the user here
        }
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedView style={styles.header}>
      <Image
              source={require('@/assets/images/app_icon.png')}
              style={styles.image}
              resizeMode="cover"
            />
        <Pressable 
          style={styles.backButton}
          onPress={handleBack}
        >
          <IconSymbol name="chevron.left" size={24} color="#000" />
        </Pressable>
        <ThemedText style={styles.headerTitle}>{user?.profile?.country} {title ? toCamelCase(title) : ''}</ThemedText>
      </ThemedView>

      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item, index) => (
          <ListItem
            key={index}
            title={item.title}
            subtitle={item.subtitle}
            url={item.url}
            onPress={() => handleItemPress('https://hulk.s3.ap-south-1.amazonaws.com/governance_india_5d0dede9a6.pdf')}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 25,
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#e00d00',
    gap: 0,
    alignItems: 'center',
    justifyContent:'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  pressed: {
    opacity: 0.7,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
  },
}); 