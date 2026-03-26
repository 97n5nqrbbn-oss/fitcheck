import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.row}>
          <Ionicons name="person-outline" size={20} color="#6c63ff" />
          <Text style={styles.rowText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={16} color="#555" style={styles.rowChevron} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <Ionicons name="notifications-outline" size={20} color="#6c63ff" />
          <Text style={styles.rowText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={16} color="#555" style={styles.rowChevron} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <Ionicons name="lock-closed-outline" size={20} color="#6c63ff" />
          <Text style={styles.rowText}>Privacy & Security</Text>
          <Ionicons name="chevron-forward" size={16} color="#555" style={styles.rowChevron} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>

        <TouchableOpacity style={styles.row}>
          <Ionicons name="star-outline" size={20} color="#6c63ff" />
          <Text style={styles.rowText}>Rate FitCheck</Text>
          <Ionicons name="chevron-forward" size={16} color="#555" style={styles.rowChevron} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <Ionicons name="help-circle-outline" size={20} color="#6c63ff" />
          <Text style={styles.rowText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={16} color="#555" style={styles.rowChevron} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <Ionicons name="document-text-outline" size={20} color="#6c63ff" />
          <Text style={styles.rowText}>Terms & Privacy</Text>
          <Ionicons name="chevron-forward" size={16} color="#555" style={styles.rowChevron} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#f87171" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>FitCheck v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  content: { padding: 24, paddingBottom: 60 },
  avatarContainer: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#6c63ff', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  name: { color: '#fff', fontSize: 22, fontWeight: '700' },
  email: { color: '#888', fontSize: 14 },
  section: { marginBottom: 24 },
  sectionTitle: { color: '#555', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16,
    marginBottom: 8, borderWidth: 1, borderColor: '#282828',
  },
  rowText: { color: '#fff', fontSize: 16, flex: 1 },
  rowChevron: { marginLeft: 'auto' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16,
    marginTop: 8, borderWidth: 1, borderColor: '#2d1f1f',
  },
  logoutText: { color: '#f87171', fontSize: 16, fontWeight: '600' },
  version: { color: '#333', fontSize: 12, textAlign: 'center', marginTop: 32 },
});
