enum SessionStatus {
  idle,
  pending,
  starting,
  containerRunning,
  tunnelConnecting,
  active,
  stopping,
  terminated,
  failed,
}

class Session {
  final String id;
  SessionStatus status;

  Session({
    required this.id,
    this.status = SessionStatus.idle,
  });
}
