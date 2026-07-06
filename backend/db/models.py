from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid

from db.database import Base
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship


class User(Base):
    """
    Stores authenticated users.
    """
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    preferred_niches = Column(String, nullable=True) # JSON encoded list of niche IDs

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    connections = relationship("PlatformConnection", back_populates="user")


class PlatformConnection(Base):
    """
    Stores OAuth tokens / API credentials for each platform a user connects.
    """
    __tablename__ = "platform_connections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    platform = Column(String(50), nullable=False, index=True)  # 'shopify' | 'amazon' | 'instagram'

    user = relationship("User", back_populates="connections")

    # Shopify fields
    shop_domain = Column(String(255), nullable=True)   # e.g. my-store.myshopify.com
    access_token = Column(Text, nullable=True)         # shpat_…

    # Amazon SP-API fields (Phase 2)
    amazon_client_id     = Column(Text, nullable=True)
    amazon_client_secret = Column(Text, nullable=True)
    amazon_refresh_token = Column(Text, nullable=True)
    amazon_marketplace_id = Column(String(50), nullable=True)

    # WooCommerce fields
    woo_consumer_key = Column(Text, nullable=True)
    woo_consumer_secret = Column(Text, nullable=True)

    # Generic / future platforms
    extra_config = Column(Text, nullable=True)   # JSON blob for extra fields

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

class Experiment(Base):
    """
    Tracks autonomous A/B tests managed by the COPE Decision Agent.
    """
    __tablename__ = "experiments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    platform = Column(String(50), nullable=False) # e.g., 'shopify'
    product_id = Column(String(100), nullable=False) # ID of the product on the platform
    status = Column(String(50), default="active") # 'active', 'completed', 'stopped'
    winner_variant_id = Column(String(255), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    variants = relationship("VariantPerformance", back_populates="experiment")

class VariantPerformance(Base):
    """
    Tracks real-time performance of generated variants for continuous learning.
    """
    __tablename__ = "variant_performance"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    experiment_id = Column(UUID(as_uuid=True), ForeignKey("experiments.id"), nullable=True)
    variant_id = Column(String(255), nullable=False, index=True)
    
    # Store the actual generated JSON blob or specific fields
    content_blob = Column(Text, nullable=True)
    
    # Live performance metrics
    impressions = Column(String(255), default="0")
    clicks = Column(String(255), default="0")
    conversions = Column(String(255), default="0")
    
    # COPE Predicted metrics (for accuracy comparison)
    predicted_ctr = Column(String(255), nullable=True)
    predicted_conversion_prob = Column(String(255), nullable=True)

    experiment = relationship("Experiment", back_populates="variants")

